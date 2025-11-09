import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { ParaclinicsDTO } from 'src/app/core/DTOs/app/paraclinics.dto';
import { PaginatorDTO } from 'src/app/core/DTOs/common/paginator/paginator.dto';
import { NotificationsService } from 'src/app/infrastructure/services/common/notifications/notifications.service';
import { ParaclinicsUseCase } from 'src/app/infrastructure/use-cases/app/paraclinics.use-case';
import { CreateUpdateParaclinicsComponent } from './create-update-paraclinics/create-update-paraclinics.component';
import { LoadingComponent } from 'src/app/presentation/common/loading/loading.component';
import { PaginationComponent } from 'src/app/presentation/common/pagination/pagination.component';

@Component({
  selector: 'app-paraclinics',
  standalone: true,
  imports: [
    CommonModule, 
    LoadingComponent, 
    PaginationComponent
  ],
  templateUrl: './paraclinics.component.html',
  styleUrl: './paraclinics.component.css'
})
export class ParaclinicsComponent implements OnInit {

  idPatient!: number;
  paraclinics: ParaclinicsDTO[] = [];
  isLoading: boolean = false;
  modalRef?: BsModalRef;

  // Variables de paginación
  currentPage: number = 1;
  pageSize: number = 10;
  pageSizeOptions = [5, 10, 25, 100];
  totalRecords: number = 0;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private _paraclinicsUseCase: ParaclinicsUseCase,
    private modalService: BsModalService,
    private _notificationService: NotificationsService
  ) {}

  ngOnInit(): void {
    this.idPatient = Number(this.route.snapshot.paramMap.get('id'));
    this.loadParaclinics();
  }

  loadParaclinics(): void {
    this.isLoading = true;
    const paginator: PaginatorDTO = {
      pageIndex: this.currentPage,
      pageSize: this.pageSize
    };

    this._paraclinicsUseCase.GetListParaclinic(paginator, this.idPatient).subscribe({
      next: (data) => {
        if (data?.results) {
          this.paraclinics = data.results;
          this.totalRecords = data.totalRecords || data.results.length;
        } else {
          this.paraclinics = [];
          this.totalRecords = 0;
        }
      },
      error: (error) => {
        console.error('Error al cargar paraclínicos', error);
        this._notificationService.showInfoMessage('Error al cargar los paraclínicos');
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }

  // Cambio de página
  onPageChange(newPage: number): void {
    this.currentPage = newPage;
    this.loadParaclinics();
  }

  // Cambio de tamaño de página
  onPageSizeChange(newSize: number): void {
    this.pageSize = newSize;
    this.currentPage = 1;
    this.loadParaclinics();
  }

  openCreateParaclinicModal() {
    const initialState = { idPatient: this.idPatient };
    this.modalRef = this.modalService.show(CreateUpdateParaclinicsComponent, {
      initialState,
      class: 'modal-xl'
    });

    (this.modalRef.content as CreateUpdateParaclinicsComponent).saved.subscribe(() => {
      this.loadParaclinics();
    });
  }

  openEditParaclinicModal(paraclinic: ParaclinicsDTO) {
    const initialState = { paraclinic, idPatient: this.idPatient };
    this.modalRef = this.modalService.show(CreateUpdateParaclinicsComponent, {
      initialState,
      class: 'modal-lg'
    });

    (this.modalRef.content as CreateUpdateParaclinicsComponent).saved.subscribe(() => {
      this.loadParaclinics();
    });
  }

  openFile(url: string | null | undefined): void {
    if (!url) return;
    window.open(url, '_blank');
  }
}
