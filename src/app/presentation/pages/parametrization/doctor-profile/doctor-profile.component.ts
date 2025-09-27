import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DoctorProfileDTO } from 'src/app/core/DTOs/app/doctor-profile-dto';
import { DoctorProfileUseCase } from '../../../../infrastructure/use-cases/app/doctor-profile-use-case';
import { NotificationsService } from 'src/app/infrastructure/services/common/notifications/notifications.service';

@Component({
  standalone: true,
  selector: 'app-doctor-profile',
  templateUrl: './doctor-profile.component.html',
  styleUrl: './doctor-profile.component.css'
})
export class DoctorProfileComponent implements OnInit {
  doctorProfile: DoctorProfileDTO[] = [];
  isLoading: boolean = false;
  modalRef?: any;
  constructor(
    private router: Router,
    private _doctorProfileUseCase: DoctorProfileUseCase,
    private _notificationService: NotificationsService

  ) { }
  ngOnInit(): void {
    throw new Error('Method not implemented.');
  }

  loadDoctorProfile() {
    this.isLoading = true;
    
  }
}
