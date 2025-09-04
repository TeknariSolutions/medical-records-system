import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { MedicineDTO } from 'src/app/core/DTOs/app/medicine.dto';
import { PaginatorDTO } from 'src/app/core/DTOs/common/paginator/paginator.dto';
import { TableResultDTO } from 'src/app/core/DTOs/common/table-result/table-result.dto';
import { NotificationsService } from 'src/app/infrastructure/services/common/notifications/notifications.service';
import { MedicineUseCase } from 'src/app/infrastructure/use-cases/app/medicine.use-case';
import { LoadingComponent } from 'src/app/presentation/common/loading/loading.component';
import { PaginationComponent } from 'src/app/presentation/common/pagination/pagination.component';
import { CreateUpdateMedicineComponent } from './create-update-medicine/create-update-medicine.component';

@Component({
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    LoadingComponent,
    PaginationComponent,
    BsDropdownModule
  ],
  selector: 'app-medicines',
  templateUrl: './medicines.component.html',
  styleUrl: './medicines.component.css'
})

export class MedicinesComponent implements OnInit {

  medicines: MedicineDTO[] = [];
  isLoading: boolean = false;
  modalRef?: BsModalRef;

  currentPage: number = 1;
  pageSize: number = 10;
  pageSizeOptions = [5, 10, 25, 100];
  totalRecords: number = 0;

  filterActiveIngredient: string = '';
  filterCommercialName: string = '';

  constructor(
    private router: Router,
    private _medicineUseCase: MedicineUseCase,
    private modalService: BsModalService,
    private _notificationService: NotificationsService
  ) { }

  ngOnInit(): void {
    this.loadMedicines();
  }


  loadMedicines() {
    this.isLoading = true;
    const paginator: PaginatorDTO = {
      pageIndex: this.currentPage,
      pageSize: this.pageSize,
    };

    this._medicineUseCase.GetListMedicines(
      paginator,
      this.filterActiveIngredient,
      this.filterCommercialName
    ).subscribe({
      next: (data: TableResultDTO) => {
        this.medicines = data.results;
        this.totalRecords = data.totalRecords;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }


  onPageChange(newPage: number): void {
    this.currentPage = newPage;
    this.loadMedicines();
  }

  onPageSizeChange(newSize: number): void {
    this.pageSize = newSize;
    this.currentPage = 1;
    this.loadMedicines();
  }

  openMedicineModal() {
    this.modalRef = this.modalService.show(CreateUpdateMedicineComponent, {
      initialState: {
      },
      class: 'modal-lg'
    });

    this.modalRef.content.onClose = (result: any) => {
      if (result === 'refresh') {
        this.loadMedicines();
      }
    };
  }

  editMedicine(medicine: MedicineDTO): void {
    const initialState = {
      medicineData: medicine,
      onClose: (result: string) => {
        if (result === 'refresh') {
          this.loadMedicines();
        }
      }
    };
    this.modalRef = this.modalService.show(CreateUpdateMedicineComponent, { initialState, class: 'modal-lg' });
  }

  deleteMedicine(idMedicine: number): void {
    this._notificationService.confirm('¿Estás seguro de eliminar este registro?', 'Esta acción no se puede deshacer.').then(confirmed => {
      if (confirmed) {
        this.isLoading = true;
        this._medicineUseCase.DeleteMedicine(idMedicine).subscribe({
          next: () => {
            this.loadMedicines();
            this.isLoading = false;
          },
          error: () => {
            this.isLoading = false;
          }
        });
      }
    });
  }

  clearFilters() {
    this.filterActiveIngredient = '';
    this.filterCommercialName = '';
    this.currentPage = 1;
    this.loadMedicines();
  }



}
