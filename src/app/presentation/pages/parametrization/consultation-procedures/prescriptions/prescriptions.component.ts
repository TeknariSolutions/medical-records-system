import { CommonModule } from '@angular/common';
import { Component, Input, Output } from '@angular/core';
import { Router } from '@angular/router';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { MedicalConsultationDTO } from 'src/app/core/DTOs/app/medical-consultation.dto';
import { PrescriptionDTO } from 'src/app/core/DTOs/app/prescription.dto';
import { TableResultDTO } from 'src/app/core/DTOs/common/table-result/table-result.dto';
import { PrescriptionsUseCase } from 'src/app/infrastructure/use-cases/app/prescriptions.use-case';
import { LoadingComponent } from 'src/app/presentation/common/loading/loading.component';
import { CreateUpdatePrescriptionComponent } from './create-update-prescription/create-update-prescription.component';
import { ResponseDTO } from 'src/app/core/DTOs/common/response/response.dto';

@Component({
  selector: 'app-prescriptions',
  standalone: true,
  imports: [
    CommonModule,
    LoadingComponent
  ],
  templateUrl: './prescriptions.component.html',
  styleUrl: './prescriptions.component.css'
})
export class PrescriptionsComponent {

  @Input() idMedicalConsultation!: number;
  @Input() consultationData!: MedicalConsultationDTO;

  prescriptions: PrescriptionDTO[] = [];

  isLoading: boolean = false;

  modalRef?: BsModalRef;

  constructor(private router: Router, 
    private modalService: BsModalService,
    private _prescriptionsUseCase: PrescriptionsUseCase) {
  }

  ngOnInit(): void {
    this.loadPrescriptions();
  }


  loadPrescriptions() {
    this.isLoading = true;

 
    this._prescriptionsUseCase.GetListPrescriptions(this.idMedicalConsultation).subscribe({
      next: (data: any) => {
        this.prescriptions = data;
        console.log(this.prescriptions)
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }


  openPrescriptionModal() {
    this.modalRef = this.modalService.show(CreateUpdatePrescriptionComponent, {
      class: 'modal-lg',
      initialState: {
        consultationData: this.consultationData
      }
    });

    this.modalRef.content.onClose = (result: any) => {
      if (result === 'refresh') {
        this.loadPrescriptions();
      }
    };
  }


}
