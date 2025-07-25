import { Component, Input } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { MedicalHistoryDTO } from 'src/app/core/DTOs/app/medical-history.dto';
import { PaginatorDTO } from 'src/app/core/DTOs/common/paginator/paginator.dto';
import { NotificationsService } from 'src/app/infrastructure/services/common/notifications/notifications.service';
import { MedicalHistoryUseCase } from 'src/app/infrastructure/use-cases/app/medical-history.use-case';
import { LoadingComponent } from 'src/app/presentation/common/loading/loading.component';
import { CreateUpdateMedicalHistoryComponent } from './create-update-medical-history/create-update-medical-history.component';

@Component({
  standalone: true,
  imports: [
    LoadingComponent
  ],
  selector: 'app-medical-histories',
  templateUrl: './medical-histories.component.html',
  styleUrl: './medical-histories.component.css'
})
export class MedicalHistoriesComponent {

  idPatient!: number;

  medicalHistories: MedicalHistoryDTO[] = [];
  isLoading: boolean = false;
  modalRef?: BsModalRef;

  constructor(private route: ActivatedRoute,
    private router: Router,
    private _medicalHistoryUseCase: MedicalHistoryUseCase,
    private modalService: BsModalService,
    private _notificationService: NotificationsService
  ) { }

  ngOnInit(): void {
    this.idPatient = Number(this.route.snapshot.paramMap.get('id'));
    console.log('ID del paciente:', this.idPatient);

    this.loadListMedicalHistory();
  }

  loadListMedicalHistory(): void {
    this.isLoading = true;
    const paginator: PaginatorDTO = {
      pageIndex: 1,
      pageSize: 1000
    };
    this._medicalHistoryUseCase.GetListMedicalHistoryPatient(paginator, this.idPatient)
      .subscribe({
        next: (data) => {
          this.medicalHistories = data.results;
          console.log(this.medicalHistories);
        },
        error: (error) => {
          console.error(error);
        },
        complete: () => {
          this.isLoading = false;
        }
      });
  }

  openEditMedicalHistoryModal(medicalHistory: MedicalHistoryDTO): void {
    const initialState = {
      lastMedicalHistory: medicalHistory,  // pasas el que se quiere editar
      idPatient: this.idPatient,
      isEditMode: true 
    };

    this.modalRef = this.modalService.show(CreateUpdateMedicalHistoryComponent, {
      initialState,
      class: 'modal-lg'
    });

    this.modalRef.onHidden?.subscribe(() => {
      this.loadListMedicalHistory(); // recargas la lista después de editar
    });
  }


}
