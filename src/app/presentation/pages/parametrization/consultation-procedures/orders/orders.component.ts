import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { OrderDTO } from 'src/app/core/DTOs/app/order.dto';
import { OrdersUseCase } from 'src/app/infrastructure/use-cases/app/orders.use-case';
import { LoadingComponent } from 'src/app/presentation/common/loading/loading.component';
import { CreateUpdateOrderComponent } from './create-update-order/create-update-order.component';
import { MedicalConsultationDTO } from 'src/app/core/DTOs/app/medical-consultation.dto';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [
    CommonModule,
    LoadingComponent
  ],
  templateUrl: './orders.component.html',
  styleUrl: './orders.component.css'
})
export class OrdersComponent {

  @Input() idMedicalConsultation!: number;
  @Input() consultationData!: MedicalConsultationDTO;

  orders: OrderDTO[] = [];

  isLoading: boolean = false;
  modalRef?: BsModalRef;

  constructor(private router: Router,
    private modalService: BsModalService,
    private _ordersUseCase: OrdersUseCase) {
  }

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders() {
    this.isLoading = true;

    this._ordersUseCase.GetListOrders(this.idMedicalConsultation).subscribe({
      next: (data: any) => {
        this.orders = data.results;
        console.log(this.orders)
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  openOrderModal() {
     this.modalRef = this.modalService.show(CreateUpdateOrderComponent, {
      class: 'modal-lg',
      initialState: {
        consultationData: this.consultationData
      }
    }); 

     // 🔹 Ahora sí me suscribo al EventEmitter
      this.modalRef.content.onClose.subscribe((result: any) => {
        if (result === 'refresh') {
          this.loadOrders();
        }
      });
  }


}
