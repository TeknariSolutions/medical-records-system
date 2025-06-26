import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';


@Component({
  standalone: true,
  selector: 'app-pagination',
  imports: [CommonModule, FormsModule],
  templateUrl: './pagination.component.html',
  styleUrl: './pagination.component.scss'
})
export class PaginationComponent {
  @Input() currentPage: number = 1;
  @Input() pageSize: number = 10;
  @Input() totalRecords: number = 0;
  @Input() pageSizeOptions: number[] = [5, 10, 25, 100];

  @Output() pageChange = new EventEmitter<number>();
  @Output() pageSizeChange = new EventEmitter<number>();

  constructor(
    
  ) { }

  get totalPages(): number {
    return Math.ceil(this.totalRecords / this.pageSize);
  }

  get startIndex(): number {
    return (this.currentPage - 1) * this.pageSize;
  }

  get endIndex(): number {
    const end = this.startIndex + this.pageSize;
    return end > this.totalRecords ? this.totalRecords : end;
  }

  onPageChange(newPage: number): void {
    if (newPage >= 1 && newPage <= this.totalPages) {
      this.pageChange.emit(newPage);
    }
  }

  onPageSizeChanged(newSize: number) {
    this.pageSize = +newSize;
    this.pageSizeChange.emit(this.pageSize);
    this.pageChange.emit(1); // Opcional: para reiniciar a la primera página
  }

}
