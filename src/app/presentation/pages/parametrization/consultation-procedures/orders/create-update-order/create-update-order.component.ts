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
  paginator: PaginatorDTO = { pageIndex: 1, pageSize: 20 };

  constructor(
    private fb: FormBuilder,
    private ordersUseCase: OrdersUseCase,
    private orderDetailsUseCase: OrderDetailsUseCase,
    private cupsCodeService: CUPSCodeService,
    private cdr: ChangeDetectorRef,
    public bsModalRef: BsModalRef
  ) {}

  ngOnInit(): void {
    this.orderForm = this.fb.group({
      generalObservations: ['', Validators.required],
      details: this.fb.array([])
    });

    if (this.orderToEdit) {
      this.orderForm.patchValue({
        generalObservations: this.orderToEdit.generalObservations
      });
      // TODO: cargar detalles de la orden si estás editando
    } else {
      this.addDetail();
    }
  }

  get details(): FormArray {
    return this.orderForm.get('details') as FormArray;
  }

  addDetail() {
    const detail = this.fb.group({
      idCupsCode: [null, Validators.required],
      cupsName: [''], // para mostrar en el input
      procedureDescription: ['', Validators.required],
      quantity: [1, [Validators.required, Validators.min(1)]],
      instructions: ['']
    });
    this.details.push(detail);
    this.cupsSuggestions.push([]);
    this.showCupsDropdown.push(false);
  }

  removeDetail(index: number) {
    this.details.removeAt(index);
    this.cupsSuggestions.splice(index, 1);
    this.showCupsDropdown.splice(index, 1);
  }

  // 🔹 Cuando escribe en el campo CUPS
  onCupsInput(value: string, index: number) {
    if (value && value.length >= 2) {
      this.searchCups(value, index);
    } else {
      this.cupsSuggestions[index] = [];
      this.showCupsDropdown[index] = false;
    }
  }

  // 🔹 Buscar CUPS en el backend
  /* searchCups(term: string, index: number) {
    this.cupsCodeService.GetListCUPS_Codes(this.paginator, term, term).subscribe({
      next: (response: ResponseDTO) => {
        const data = response.data as TableResultDTO;
        const results = data?.results || [];
        this.cupsSuggestions[index] = results;
        this.showCupsDropdown[index] = results.length > 0;
        this.cdr.detectChanges();
      },
      error: () => {
        this.cupsSuggestions[index] = [];
        this.showCupsDropdown[index] = false;
      }
    });
  } */

  searchCups(term: string, index: number) {
    const isCode = /^[0-9]+$/.test(term); // 👈 si solo números => es código

    this.cupsCodeService
      .GetListCUPS_Codes(
        this.paginator,
        isCode ? term : '',  // si es código lo mando aquí
        !isCode ? term : ''  // si es texto lo mando aquí
      )
      .subscribe({
        next: (response: ResponseDTO) => {
          const data = response.data as TableResultDTO;
          const results = data?.results || [];
          this.cupsSuggestions[index] = results;
          this.showCupsDropdown[index] = results.length > 0;
          this.cdr.detectChanges();
        },
        error: () => {
          this.cupsSuggestions[index] = [];
          this.showCupsDropdown[index] = false;
        }
      });
  }


  // 🔹 Selección de un CUPS
  selectCups(cup: any, index: number) {
    const group = this.details.at(index) as FormGroup;
    group.get('idCupsCode')?.setValue(cup.idCupsCode);
    group.get('cupsName')?.setValue(`${cup.code} - ${cup.name}`);
    group.get('procedureDescription')?.setValue(cup.name);
    this.cupsSuggestions[index] = [];
    this.showCupsDropdown[index] = false;
  }

  // 🔹 Guardar
  onSubmit() {
    if (this.orderForm.invalid) {
      this.orderForm.markAllAsTouched();
      return;
    }

    const orderData: OrderDTO = {
      idOrder: this.orderToEdit ? this.orderToEdit.idOrder : 0,
      idMedicalConsultation: this.consultationData.idMedicalConsultation,
      idPatient: this.consultationData.idPatient,
      idUser: this.consultationData.idUser,
      orderDate: new Date(),
      generalObservations: this.orderForm.value.generalObservations,
      isActive: true
    };

    if (this.orderToEdit) {
      // actualizar orden + sus detalles
      this.ordersUseCase.UpdateOrders(orderData).subscribe({
        next: (res) => {
          if (res.isSuccess) {
            this.onClose.emit('refresh');
            this.bsModalRef.hide();
          }
        }
      });
      return;
    }

    // 🔹 Crear nueva orden
    this.ordersUseCase.CreateOrders(orderData).subscribe({
      next: (res) => {
        if (res.isSuccess) {
          const createdOrderId = res.data.idOrder || res.data; // según backend

          const details: OrderDetailsDTO[] = this.details.value.map((d: any) => ({
            idOrderDetail: 0,
            idOrder: createdOrderId,
            idCupsCode: d.idCupsCode,
            procedureDescription: d.procedureDescription,
            quantity: d.quantity,
            instructions: d.instructions,
            registeredByUser: this.consultationData.idUser,
            registeredAt: new Date(),
            updatedByUserId: this.consultationData.idUser,
            updatedAt: new Date()
          }));

          // ejecutar en paralelo
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
