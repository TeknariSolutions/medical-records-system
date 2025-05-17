import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { UserDTO } from 'src/app/core/DTOs/app/user.dto';
import { PaginatorDTO } from 'src/app/core/DTOs/common/paginator/paginator.dto';
import { TableResultDTO } from 'src/app/core/DTOs/common/table-result/table-result.dto';
import { UsersUseCase } from 'src/app/infrastructure/use-cases/app/users.use-case';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrl: './users.component.css'
})
export class UsersComponent implements OnInit  {

  users: UserDTO[] = [];
  isLoading: boolean = false;
  modalRef?: BsModalRef;

   constructor(
    private router: Router,
    private _phoneBookUseCase: UsersUseCase,
    private modalService: BsModalService
   ) {}


  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers() {
    this.isLoading = true;
    const paginator: PaginatorDTO = {
      pageIndex: 1,
      pageSize: 1000
    };

    this._phoneBookUseCase.GetListUsers(paginator, '').subscribe({
      next: (data: TableResultDTO) => {
        this.users = data.results;
        this.isLoading = false;
      }
    });
  }

}
