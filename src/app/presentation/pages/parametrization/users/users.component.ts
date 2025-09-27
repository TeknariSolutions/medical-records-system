import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { UserDTO } from 'src/app/core/DTOs/app/user.dto';
import { PaginatorDTO } from 'src/app/core/DTOs/common/paginator/paginator.dto';
import { TableResultDTO } from 'src/app/core/DTOs/common/table-result/table-result.dto';
import { UsersUseCase } from 'src/app/infrastructure/use-cases/app/users.use-case';
import { CreateUpdateUserComponent } from './create-update-user/create-update-user.component';
import { LoadingComponent } from 'src/app/presentation/common/loading/loading.component';
import { NotificationsService } from 'src/app/infrastructure/services/common/notifications/notifications.service';
import { NgClass } from '@angular/common';
import { PaginationComponent } from 'src/app/presentation/common/pagination/pagination.component';


@Component({
  standalone: true,
  imports: [
    NgClass,
    LoadingComponent,
    PaginationComponent
  ],
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrl: './users.component.css'
})
export class UsersComponent implements OnInit {

  users: UserDTO[] = [];
  isLoading: boolean = false;
  modalRef?: BsModalRef;

  IdCompany: number = Number(localStorage.getItem('IdCompany'));

  currentPage: number = 1;
  pageSize: number = 10;
  pageSizeOptions = [5, 10, 25, 100];
  totalRecords: number = 0;

  constructor(
    private router: Router,
    private _userUseCase: UsersUseCase,
    private modalService: BsModalService,
    private _notificationService: NotificationsService
  ) { }


  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers() {
    this.isLoading = true;
    const paginator: PaginatorDTO = {
      pageIndex: 1,
      pageSize: 1000
    };

    this._userUseCase.GetListUsers(paginator, '', this.IdCompany).subscribe({
      next: (data: TableResultDTO) => {
        this.users = data.results;
        this.totalRecords = data.totalRecords;
        this.isLoading = false;
      }
    });
  }

  openUserModal() {
    this.modalRef = this.modalService.show(CreateUpdateUserComponent, {
      initialState: {
      },
      class: 'modal-lg'
    });

    this.modalRef.content.onClose = (result: any) => {
      if (result === 'refresh') {
        this.loadUsers();
      }
    };
  }

  editUser(user: UserDTO): void {
    const initialState = {
      userData: user,
      onClose: (result: string) => {
        if (result === 'refresh') {
          this.loadUsers();
        }
      }
    };
    this.modalRef = this.modalService.show(CreateUpdateUserComponent, { initialState, class: 'modal-lg' });
  }

  deleteUser(idUser: number): void {
    this._notificationService.confirm('¿Estás seguro de eliminar este registro?', 'Esta acción no se puede deshacer.').then(confirmed => {
      if (confirmed) {
        this.isLoading = true;
        this._userUseCase.DeleteUser(idUser).subscribe({
          next: () => {
            this.loadUsers();
            this.isLoading = false;
          },
          error: () => {
            this.isLoading = false;
          }
        });
      }
    });
  }

  onPageChange(newPage: number): void {
    this.currentPage = newPage;
    this.loadUsers();
  }

  onPageSizeChange(newSize: number): void {
    this.pageSize = newSize;
    this.currentPage = 1;
    this.loadUsers();
  }
goToDoctorProfile(idUser: number): void {
    this.router.navigate(['/parametrization/doctor-profile', idUser]);
  }

}
