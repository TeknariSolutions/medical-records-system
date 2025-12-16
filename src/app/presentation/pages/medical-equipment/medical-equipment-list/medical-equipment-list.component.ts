import { CommonModule, NgClass } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { LoadingComponent } from 'src/app/presentation/common/loading/loading.component';
import { PaginationComponent } from 'src/app/presentation/common/pagination/pagination.component';
import { PaginatorDTO } from 'src/app/core/DTOs/common/paginator/paginator.dto';
import { TableResultDTO } from 'src/app/core/DTOs/common/table-result/table-result.dto';
import { MedicalEquipmentDTO } from 'src/app/core/DTOs/app/medical-equipment.dto';
import { MedicalEquipmentsUseCase } from 'src/app/infrastructure/use-cases/app/medical-equipment.use.case';
import { NotificationsService } from 'src/app/infrastructure/services/common/notifications/notifications.service';
import { CreateUpdateMedicalEquipmentComponent } from '../create-update-medical-equipment/create-update-medical-equipment.component';

@Component({
  selector: 'app-medical-equipment-list',
  standalone: true,
  imports: [
    CommonModule,
    NgClass,
    FormsModule,
    ReactiveFormsModule,
    LoadingComponent,
    PaginationComponent
  ],
  templateUrl: './medical-equipment-list.component.html',
  styleUrl: './medical-equipment-list.component.css'
})
export class MedicalEquipmentListComponent implements OnInit {

  medicalEquipments: MedicalEquipmentDTO[] = [];
  isLoading: boolean = false;
  modalRef?: BsModalRef;

  // 🔹 Paginación
  currentPage: number = 1;
  pageSize: number = 10;
  pageSizeOptions = [5, 10, 25, 100];
  totalRecords: number = 0;

  constructor(
    private _medicalEquipmentsUseCase: MedicalEquipmentsUseCase,
    private modalService: BsModalService,
    private _notificationService: NotificationsService
  ) { }

  ngOnInit(): void {
    this.loadMedicalEquipments();
  }

  /** 🔄 Cargar listado */
  loadMedicalEquipments(): void {
    this.isLoading = true;

    const paginator: PaginatorDTO = {
      pageIndex: this.currentPage,
      pageSize: this.pageSize
    };

    this._medicalEquipmentsUseCase.GetListMedicalEquipment(paginator).subscribe({
      next: (data) => {
        if (data) {
          const table = data as TableResultDTO;
          this.medicalEquipments = table.results || [];
          this.totalRecords = table.totalRecords || 0;
        } else {
          this.medicalEquipments = [];
          this.totalRecords = 0;
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error al cargar equipos médicos', err);
        this.isLoading = false;
      }
    });
  }

 
  onPageChange(newPage: number): void {
    this.currentPage = newPage;
    this.loadMedicalEquipments();
  }


  onPageSizeChange(newSize: number): void {
    this.pageSize = newSize;
    this.currentPage = 1;
    this.loadMedicalEquipments();
  }

  openCreateEquipmentModal(): void {
    this.modalRef = this.modalService.show(CreateUpdateMedicalEquipmentComponent, {
      initialState: {},
      class: 'modal-lg'
    });

    this.modalRef.content.onClose = (result: string) => {
      if (result === 'refresh') {
        this.loadMedicalEquipments();
      }
    };
  }


  editEquipment(equipment: MedicalEquipmentDTO): void {
    const initialState = {
      equipmentData: equipment,
      onClose: (result: string) => {
        if (result === 'refresh') {
          this.loadMedicalEquipments();
        }
      }
    };
    this.modalRef = this.modalService.show(CreateUpdateMedicalEquipmentComponent, {
      initialState,
      class: 'modal-lg'
    });
  }


  /* deleteEquipment(idMedicalEquipment: number): void {
    this._notificationService
      .confirm('¿Estás seguro de eliminar este equipo?', 'Esta acción no se puede deshacer.')
      .then(confirmed => {
        if (confirmed) {
          this.isLoading = true;
          const idCompany = Number(localStorage.getItem('IdCompany')) || 0;

          this._medicalEquipmentsUseCase.DeleteMedicalEquipment(idMedicalEquipment, idCompany).subscribe({
            next: (success) => {
              if (success) {
                this._notificationService.showToastSuccessMessage('Equipo eliminado correctamente');
                this.loadMedicalEquipments();
              }
              this.isLoading = false;
            },
            error: () => {
              this._notificationService.showToastErrorMessage('Error al eliminar el equipo');
              this.isLoading = false;
            }
          });
        }
      });
  } */

 /*  deleteEquipment(idMedicalEquipment: number): void {
    this._notificationService
      .confirm('¿Estás seguro de eliminar este equipo?', 'Esta acción no se puede deshacer.')
      .then(confirmed => {
        if (confirmed) {
          const idCompany = Number(localStorage.getItem('IdCompany')) || 0;

          this._medicalEquipmentsUseCase
            .DeleteMedicalEquipment(idMedicalEquipment, idCompany)
            .subscribe({
              next: (success) => {
                if (success) {
                  this._notificationService.showToastSuccessMessage('Equipo eliminado correctamente');
                  this.loadMedicalEquipments(); // 🔥 único responsable del refresh
                }
              },
              error: () => {
                this._notificationService.showToastErrorMessage('Error al eliminar el equipo');
              }
            });
        }
      });
  } */

  deleteEquipment(idMedicalEquipment: number): void {
    this._notificationService.confirm('¿Estás seguro de eliminar este registro?', 'Esta acción no se puede deshacer.').then(confirmed => {
      if (confirmed) {
        this.isLoading = true;
        const idCompany = Number(localStorage.getItem('IdCompany')) || 0;
        this._medicalEquipmentsUseCase
          .DeleteMedicalEquipment(idMedicalEquipment, idCompany).subscribe({
            next: () => {
              this.loadMedicalEquipments();
              this.isLoading = false;
            },
            error: () => {
              this.isLoading = false;
            }
          });
      }
    });
  }

}
