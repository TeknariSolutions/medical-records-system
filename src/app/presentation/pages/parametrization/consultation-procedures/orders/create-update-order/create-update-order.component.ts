import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, ChangeDetectorRef, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormArray } from '@angular/forms';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { OrdersUseCase } from 'src/app/infrastructure/use-cases/app/orders.use-case';
import { OrderDetailsUseCase } from 'src/app/infrastructure/use-cases/app/order-details.use-case';
import { MedicalConsultationDTO } from 'src/app/core/DTOs/app/medical-consultation.dto';
import { OrderDTO } from 'src/app/core/DTOs/app/order.dto';
import { OrderDetailsDTO } from 'src/app/core/DTOs/app/order-details.dto';
import { CUPSCodeService } from 'src/app/infrastructure/services/common/CUPS-Code/cups-code.service';
import { PaginatorDTO } from 'src/app/core/DTOs/common/paginator/paginator.dto';
import { TableResultDTO } from 'src/app/core/DTOs/common/table-result/table-result.dto';
import { forkJoin } from 'rxjs';
import { ResponseDTO } from 'src/app/core/DTOs/common/response/response.dto';
import { CupsCodeUseCase } from 'src/app/infrastructure/use-cases/common/cups-code.use.case';
import { DateTimeHelper } from 'src/app/infrastructure/helpers/date-time.helper';


@Component({
  selector: 'app-create-update-order',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './create-update-order.component.html',
  styleUrl: './create-update-order.component.css'
})
export class CreateUpdateOrderComponent implements OnInit {

  @Input() consultationData!: MedicalConsultationDTO;
  @Input() orderToEdit?: OrderDTO;
  @Output() onClose = new EventEmitter<string>();

  orderForm!: FormGroup;
  cupsSuggestions: any[][] = [];   // sugerencias por cada detalle
  showCupsDropdown: boolean[] = []; // visibilidad dropdown
  //paginator: PaginatorDTO = { pageIndex: 1, pageSize: 20 };

  cupsPaginator: PaginatorDTO[] = [];
  totalCupsPagesByDetail: number[] = [];

  submitted = false;

  constructor(
    private fb: FormBuilder,
    private ordersUseCase: OrdersUseCase,
    private orderDetailsUseCase: OrderDetailsUseCase,
    private cupsCodeService: CUPSCodeService,
    private _cupsCodeUseCase: CupsCodeUseCase,
    private cdr: ChangeDetectorRef,
    public bsModalRef: BsModalRef
  ) {}



  ngOnInit(): void {
    this.orderForm = this.fb.group({
      generalObservations: ['', Validators.required],
      details: this.fb.array([])
    });


    if (this.orderToEdit) {
      // precargar observaciones generales
      this.orderForm.patchValue({
        generalObservations: this.orderToEdit.generalObservations || ''
      });

      this.loadOrderDetails(this.orderToEdit.idOrder);
    } else {
      this.addDetail();
    }
  }


 
 
  loadOrderDetails(idOrder: number) {
    this.orderDetailsUseCase.GetListOrderDetailsByOrder(idOrder).subscribe(res => {
      // aquí res ya es el objeto { results: [...], totalRecords: 0 }
      const orderDetails = res.results;
      

      orderDetails.forEach(d => {
        this._cupsCodeUseCase.GetCUPSCodeById(d.idCupsCode).subscribe(cups => {
          const cupsData = cups;

          const detailGroup = this.fb.group({
            idOrderDetail: [d.idOrderDetail],
            idCupsCode: [d.idCupsCode, Validators.required],
            cupsName: [`${cupsData.code} - ${cupsData.name}`],
            procedureDescription: [cupsData.description],
            quantity: [d.quantity, Validators.required],
            instructions: [d.instructions]
          });

          this.details.push(detailGroup);

          this.cupsSuggestions.push([]);
          this.showCupsDropdown.push(false);
          this.cupsPaginator.push({ pageIndex: 1, pageSize: 10 });
          this.totalCupsPagesByDetail.push(1);
        });
      });
    });
  }

  get details(): FormArray {
    return this.orderForm.get('details') as FormArray;
  }

  addDetail() {
    const detail = this.fb.group({
      idCupsCode: [null, Validators.required],
      cupsName: ['', Validators.required],
      procedureDescription: ['', Validators.required],
      quantity: [null, Validators.required],
      instructions: ['']
    });

    this.details.push(detail);
    this.cupsSuggestions.push([]);
    this.showCupsDropdown.push(false);
    this.cupsPaginator.push({ pageIndex: 1, pageSize: 10 });
    this.totalCupsPagesByDetail.push(1);
  }

  removeDetail(index: number) {
    this.details.removeAt(index);
    this.cupsSuggestions.splice(index, 1);
    this.showCupsDropdown.splice(index, 1);
    this.cupsPaginator.splice(index, 1);
    this.totalCupsPagesByDetail.splice(index, 1);
  }

  // Cuando escribe en el campo CUPS

  onCupsInput(value: string, index: number) {
    if (value && value.length >= 2) {
      this.cupsPaginator[index].pageIndex = 1; // reset
      this.searchCups(value, index);
    } else {
      this.cupsSuggestions[index] = [];
      this.showCupsDropdown[index] = false;
    }
  }


  // Buscar CUPS en el backend

  searchCups(term: string, index: number) {
    const isCode = /^[0-9]+$/.test(term);

    this._cupsCodeUseCase
      .GetListCUPS_Codes(
        this.cupsPaginator[index],
        isCode ? term : '',
        !isCode ? term : ''
      )
      .subscribe({
        next: (data: TableResultDTO) => {
          this.cupsSuggestions[index] = data.results || [];
          this.totalCupsPagesByDetail[index] = data.totalRecords || 1;
          this.showCupsDropdown[index] = this.cupsSuggestions[index].length > 0;
          this.cdr.detectChanges();
        },
        error: () => {
          this.cupsSuggestions[index] = [];
          this.showCupsDropdown[index] = false;
        }
      });
  }


  selectCups(cups: any, index: number) {
    this.details.at(index).patchValue({
      idCupsCode: cups.idCupsCode,
      cupsName: `${cups.code} - ${cups.name}`, // 🔹 aquí mejor mostrar el formato completo
      procedureDescription: cups.description
    });

    this.showCupsDropdown[index] = false;
    this.cdr.detectChanges(); // 🔹 fuerza actualización del DOM
  }


  nextCupsPage(index: number) {
    if (this.cupsPaginator[index].pageIndex < (this.totalCupsPagesByDetail[index] || 1)) {
      this.cupsPaginator[index].pageIndex++;
      this.searchCups(this.details.at(index).get('cupsName')?.value, index);
    }
  }

  previousCupsPage(index: number) {
    if (this.cupsPaginator[index].pageIndex > 1) {
      this.cupsPaginator[index].pageIndex--;
      this.searchCups(this.details.at(index).get('cupsName')?.value, index);
    }
  }


 onSubmit() {

  this.submitted = true;

  if (this.orderForm.invalid) {
    this.orderForm.markAllAsTouched();
    return;
  }

  const orderData: OrderDTO = {
    idOrder: this.orderToEdit ? this.orderToEdit.idOrder : 0,
    idMedicalConsultation: this.consultationData.idMedicalConsultation,
    idPatient: this.consultationData.idPatient,
    idUser: this.consultationData.idUser,
    orderDate: DateTimeHelper.getLocalDateTimeWithOffset(),
    generalObservations: this.orderForm.value.generalObservations,
    isActive: true
  };

  if (this.orderToEdit) {
    // 👉 Actualizar orden + detalles
    this.ordersUseCase.UpdateOrders(orderData).subscribe({
      next: (res) => {
        if (res.isSuccess) {
          const details: OrderDetailsDTO[] = this.details.value.map((d: any) => ({
            idOrderDetail: d.idOrderDetail ?? 0,
            idOrder: orderData.idOrder,
            idCupsCode: d.idCupsCode,
            procedureDescription: d.procedureDescription,
            quantity: d.quantity,
            instructions: d.instructions,
            registeredByUser: this.consultationData.idUser,
            registeredAt: DateTimeHelper.getLocalDateTimeWithOffset(),
            updatedByUserId: this.consultationData.idUser,
            updatedAt: DateTimeHelper.getLocalDateTimeWithOffset(),
          }));

          const requests = details.map(detail =>
            detail.idOrderDetail && detail.idOrderDetail > 0
              ? this.orderDetailsUseCase.UpdateOrderDetails(detail)
              : this.orderDetailsUseCase.CreateOrderDetails(detail)
          );

          forkJoin(requests).subscribe({
            next: () => {
              this.onClose.emit('refresh');
              this.bsModalRef.hide();
            },
            error: (err) => console.error('Error procesando detalles', err)
          });
        }
      }
    });
    return;
  }

  // Crear nueva orden
  this.ordersUseCase.CreateOrders(orderData).subscribe({
    next: (res) => {
      if (res.isSuccess) {
        const createdOrderId = res.data.idOrder || res.data;

        const details: OrderDetailsDTO[] = this.details.value.map((d: any) => ({
          idOrderDetail: 0,
          idOrder: createdOrderId,
          idCupsCode: d.idCupsCode,
          procedureDescription: d.procedureDescription,
          quantity: d.quantity,
          instructions: d.instructions,
          registeredByUser: this.consultationData.idUser,
          registeredAt: DateTimeHelper.getLocalDateTimeWithOffset(),
          updatedByUserId: this.consultationData.idUser,
          updatedAt: DateTimeHelper.getLocalDateTimeWithOffset(),
        }));

        const requests = details.map(detail =>
          this.orderDetailsUseCase.CreateOrderDetails(detail)
        );

        forkJoin(requests).subscribe({
          next: () => {
            this.onClose.emit('refresh');
            this.bsModalRef.hide();
          },
          error: (err) => console.error('Error creando detalles', err)
        });
      }
    }
  });
}

close() {
    this.bsModalRef.hide();
  }
}
