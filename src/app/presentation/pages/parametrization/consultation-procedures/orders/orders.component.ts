import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { OrderDTO } from 'src/app/core/DTOs/app/order.dto';
import { OrdersUseCase } from 'src/app/infrastructure/use-cases/app/orders.use-case';
import { LoadingComponent } from 'src/app/presentation/common/loading/loading.component';
import { CreateUpdateOrderComponent } from './create-update-order/create-update-order.component';
import { MedicalConsultationDTO } from 'src/app/core/DTOs/app/medical-consultation.dto';
import { DoctorProfileUseCase } from 'src/app/infrastructure/use-cases/app/doctor-profile-use-case';
import { PatientsUseCase } from 'src/app/infrastructure/use-cases/app/patients.use-case';
import { NotificationsService } from 'src/app/infrastructure/services/common/notifications/notifications.service';
import { DetailsOrdenComponent } from './details-orden/details-orden.component';
import { PatientDTO } from 'src/app/core/DTOs/app/patient.dto';

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
  @Input() patientData!: PatientDTO;

  orders: OrderDTO[] = [];

  isLoading: boolean = false;
  modalRef?: BsModalRef;

  constructor(private router: Router,
    private modalService: BsModalService,
    private _ordersUseCase: OrdersUseCase,
    private _doctorProfileUseCase: DoctorProfileUseCase,
    private _patientsUseCase: PatientsUseCase,
    private _notificationService: NotificationsService) {
  }

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders() {
    this.isLoading = true;

    this._ordersUseCase.GetListOrders(this.idMedicalConsultation).subscribe({
      next: (data: any) => {
        this.orders = data.results;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  openOrderModal(order?: OrderDTO) {
    this.modalRef = this.modalService.show(CreateUpdateOrderComponent, {
      class: 'modal-xl',
      initialState: {
        consultationData: this.consultationData,
        orderToEdit: order
      }
    });

    // 🔹 Ahora sí me suscribo al EventEmitter
    this.modalRef.content.onClose.subscribe((result: any) => {
      if (result === 'refresh') {
        this.loadOrders();
      }
    });
  }
/* 
  onDownloadPDF(order: OrderDTO) {
    const component = new DetailsOrdenComponent(
      this._ordersUseCase,
      this._doctorProfileUseCase,
      this._patientsUseCase,
      this._notificationService
    );

    component.idPatient = order.idPatient;
    component.idMedicalConsultation = this.idMedicalConsultation;
    component.orderData = order;
    component.patientData = this.patientData; // o como lo estés trayendo
    component.consultationData = this.consultationData;

    component.generatePDF();
  } */

  onDownloadPDF(order: OrderDTO) {
  const component = new DetailsOrdenComponent(
    this._doctorProfileUseCase,
    this._patientsUseCase,
    this._notificationService
  );

  component.idPatient = order.idPatient;
  component.orderData = order;
  component.patientData = this.patientData; // o la forma en que tienes el paciente
  component.generatePDF();
}



}
