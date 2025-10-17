import { Component, Input } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { MedicalHistoryDTO } from 'src/app/core/DTOs/app/medical-history.dto';
import { PaginatorDTO } from 'src/app/core/DTOs/common/paginator/paginator.dto';
import { NotificationsService } from 'src/app/infrastructure/services/common/notifications/notifications.service';
import { MedicalHistoryUseCase } from 'src/app/infrastructure/use-cases/app/medical-history.use-case';
import { LoadingComponent } from 'src/app/presentation/common/loading/loading.component';
import { CreateUpdateMedicalHistoryComponent } from './create-update-medical-history/create-update-medical-history.component';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  imports: [
    CommonModule,
    LoadingComponent
  ],
  selector: 'app-medical-histories',
  templateUrl: './medical-histories.component.html',
  styleUrl: './medical-histories.component.scss'
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
        },
        error: (error) => {
          console.error(error);
        },
        complete: () => {
          this.isLoading = false;
        }
      });
  }


  openViewMedicalHistoryModal(medicalHistory: MedicalHistoryDTO): void {
  const initialState = {
    lastMedicalHistory: medicalHistory,
    idPatient: this.idPatient,
    idUser: Number(localStorage.getItem('IdUser')),
    isReadOnly: true,
    isEditMode: false
  };

  this.modalRef = this.modalService.show(CreateUpdateMedicalHistoryComponent, {
    initialState,
    class: 'modal-lg'
  });
}

  /* openEditLastMedicalHistoryModal(): void {
    if (!this.medicalHistories.length) {
      this._notificationService.showInfoMessage('No hay antecedentes para editar');
      return;
    }

    const lastHistory = this.medicalHistories[0];

    const initialState = {
      lastMedicalHistory: lastHistory,
      idPatient: this.idPatient,
      idUser: Number(localStorage.getItem('IdUser')),
      isReadOnly: false,
      isEditMode: false, // 👈 muy importante: no edición real
      createFromExisting: true // 👈 flag opcional para saber de dónde viene
    };

    this.modalRef = this.modalService.show(CreateUpdateMedicalHistoryComponent, {
      initialState,
      class: 'modal-lg'
    });

    this.modalRef.onHidden?.subscribe(() => this.loadListMedicalHistory());
  } */

  openEditLastMedicalHistoryModal(): void {
  this._medicalHistoryUseCase.GetLastMedicalHistory(this.idPatient)
    .subscribe({
      next: (lastHistory) => {
        if (!lastHistory) {
          this._notificationService.showInfoMessage('No hay antecedentes para editar');
          return;
        }

        const initialState = {
          lastMedicalHistory: lastHistory,
          idPatient: this.idPatient,
          idUser: Number(localStorage.getItem('IdUser')),
          isReadOnly: false,
          isEditMode: false, // 👈 no edición real
          createFromExisting: true
        };

        this.modalRef = this.modalService.show(CreateUpdateMedicalHistoryComponent, {
          initialState,
          class: 'modal-lg'
        });

        this.modalRef.onHidden?.subscribe(() => this.loadListMedicalHistory());
      },
      error: (err) => {
        console.error('Error al cargar el último antecedente', err);
        this._notificationService.showToastErrorMessage(
          'No se pudo cargar el último antecedente ❌'
        );
      }
    });
}


  goBackToProcedures(): void {
    if (this.idPatient) {
      this.router.navigate([`/parametrization/patient-procedures`, this.idPatient]);
    } else {
      this._notificationService.showToastErrorMessage(
        'No se pudo determinar el paciente ❌'
      );
    }
  }


}
