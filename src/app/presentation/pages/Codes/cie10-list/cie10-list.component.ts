import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { PaginatorDTO } from 'src/app/core/DTOs/common/paginator/paginator.dto';
import { TableResultDTO } from 'src/app/core/DTOs/common/table-result/table-result.dto';
import { Cie10Service } from 'src/app/infrastructure/services/common/CIE10/cie10.service';
import { NotificationsService } from 'src/app/infrastructure/services/common/notifications/notifications.service';
import { LoadingComponent } from 'src/app/presentation/common/loading/loading.component';
import { PaginationComponent } from 'src/app/presentation/common/pagination/pagination.component';

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
  selector: 'app-cie10-list',
  templateUrl: './cie10-list.component.html',
  styleUrl: './cie10-list.component.css'
})
export class CIE10ListComponent {

  cie10Codes: any[] = [];
  isLoading: boolean = false;

  currentPage: number = 1;
  pageSize: number = 10;
  pageSizeOptions = [5, 10, 25, 100];
  totalRecords: number = 0;

  filterDescription: string = '';
  filterCode: string = '';
  filterName: string = '';

  constructor(
    private _Cie10Service: Cie10Service,
    private _notificationService: NotificationsService
  ) {
    this.loadCie10();
  }

  loadCie10() {

    this.isLoading = true;
    const paginator: PaginatorDTO = {
      pageIndex: this.currentPage,
      pageSize: this.pageSize,
    };

    this._Cie10Service.GetListCIECodes(
      paginator,
      this.filterDescription,
      this.filterCode,
      this.filterName
    ).subscribe({
      next: (res) => {
        if (res.isSuccess && res.data) {
          const table = res.data as TableResultDTO;
          this.cie10Codes = table.results;
          console.log(this.cie10Codes)
          this.totalRecords = table.totalRecords;
        } else {
          this.isLoading = false;
        }
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  onPageChange(newPage: number): void {
    this.currentPage = newPage;
    this.loadCie10();
  }

  onPageSizeChange(newSize: number): void {
    this.pageSize = newSize;
    this.currentPage = 1;
    this.loadCie10();
  }

  clearFilters() {
    this.filterDescription = '';
    this.filterCode = '';
    this.filterName = '';
    this.currentPage = 1;
    this.loadCie10();
  }

}
