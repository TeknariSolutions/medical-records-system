import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { ParaclinicsDTO } from 'src/app/core/DTOs/app/paraclinics.dto';
import { PaginatorDTO } from 'src/app/core/DTOs/common/paginator/paginator.dto';
import { NotificationsService } from 'src/app/infrastructure/services/common/notifications/notifications.service';
import { ParaclinicsUseCase } from 'src/app/infrastructure/use-cases/app/paraclinics.use-case';
import { CreateUpdateParaclinicsComponent } from './create-update-paraclinics/create-update-paraclinics.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-paraclinics',
  standalone: true,
  imports: [
    CommonModule
  ],
  templateUrl: './paraclinics.component.html',
  styleUrl: './paraclinics.component.css'
})
export class ParaclinicsComponent {

    idPatient!: number;
  
    paraclinics: ParaclinicsDTO[] = [];
    isLoading: boolean = false;
    modalRef?: BsModalRef;
  
    constructor(private route: ActivatedRoute,
      private router: Router,
      private _paraclinicsUseCase: ParaclinicsUseCase,
      private modalService: BsModalService,
      private _notificationService: NotificationsService
    ) { }
  
    ngOnInit(): void {
      this.idPatient = Number(this.route.snapshot.paramMap.get('id'));
     
      this.loadParaclinics();
    }

  loadParaclinics(): void {
    this.isLoading = true;
    const paginator: PaginatorDTO = {
      pageIndex: 1,
      pageSize: 1000
    };
    this._paraclinicsUseCase.GetListParaclinic(paginator, this.idPatient).subscribe({
        next: (data) => {
          this.paraclinics = data.results;
        },
        error: (error) => {
          console.error(error);
        },
        complete: () => {
          this.isLoading = false;
        }
      });
  }

  openCreateParaclinicModal() {
    const initialState = { idPatient: this.idPatient };
    this.modalRef = this.modalService.show(CreateUpdateParaclinicsComponent, {
      initialState,
      class: 'modal-lg' 
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



}
