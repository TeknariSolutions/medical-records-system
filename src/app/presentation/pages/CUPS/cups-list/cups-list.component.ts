import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PaginatorDTO } from 'src/app/core/DTOs/common/paginator/paginator.dto';
import { TableResultDTO } from 'src/app/core/DTOs/common/table-result/table-result.dto';
import { CupsCodeUseCase } from 'src/app/infrastructure/use-cases/common/cups-code.use.case';
import { LoadingComponent } from 'src/app/presentation/common/loading/loading.component';
import { PaginationComponent } from 'src/app/presentation/common/pagination/pagination.component';

@Component({
  selector: 'app-cups-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    LoadingComponent,
    PaginationComponent,
  ],
  templateUrl: './cups-list.component.html',
  styleUrl: './cups-list.component.css'
})
export class CupsListComponent implements OnInit {

  cupsCodes: any[] = [];
  isLoading: boolean = false;

  currentPage: number = 1;
  pageSize: number = 10;
  pageSizeOptions = [5, 10, 25, 100];
  totalRecords: number = 0;

  filterCode: string = '';
  filterName: string = '';


  constructor(
    private _cupsCodeUseCase: CupsCodeUseCase
  ) { }

  ngOnInit(): void {
    this.loadCUPS();
  }


  loadCUPS() {
  this.isLoading = true;
  const paginator: PaginatorDTO = {
    pageIndex: this.currentPage,
    pageSize: this.pageSize,
  };

  this._cupsCodeUseCase
    .GetListCUPS_Codes(paginator, this.filterCode, this.filterName)
    .subscribe({
      next: (data) => {
        if (data) {
          const table = data as TableResultDTO;
          this.cupsCodes = table.results;
          this.totalRecords = table.totalRecords;
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
    this.loadCUPS();
  }

  onPageSizeChange(newSize: number): void {
    this.pageSize = newSize;
    this.currentPage = 1;
    this.loadCUPS();
  }

  clearFilters() {
    this.filterCode = '';
    this.filterName = '';
    this.currentPage = 1;
    this.loadCUPS();
  }

}
