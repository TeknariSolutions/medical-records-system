import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root'
})
export class NotificationsService {

  constructor(public translate: TranslateService) {}

  private openToastSwal(title: string, text: string, icon: 'success' | 'error' | 'warning' | 'info') {
    Swal.fire({
      title: title,
      text: text,
      icon: icon,
      position: 'top-end',
      timer: 3000,
      toast: true,
      showConfirmButton: false,
      showCloseButton: true,
      timerProgressBar: true
    });
  }

  private openSwal(title: string, text: string, icon: 'success' | 'error' | 'warning' | 'info') {
    Swal.fire({
      title: title,
      text: text,
      icon: icon,
      position: 'center',
      timer: 3000,
      toast: false,
      showConfirmButton: false,
      showCloseButton: true,
      timerProgressBar: true
    });
  }


  private getLoginProgressStyles(): string {
    return `
      <style>
        .login-steps-container {
          display: flex;
          flex-direction: column;
          gap: 12px;
          padding: 10px 0;
        }
        .login-step {
          display: flex;
          padding: 10px;
          border-radius: 8px;
          background-color: #f8f9fa;
          opacity: 0.7;
          transition: all 0.3s ease;
        }
        .login-step.active {
          background-color: #e8f4ff;
          opacity: 1;
          box-shadow: 0 2px 5px rgba(0,0,0,0.1);
        }
        .login-step.completed {
          background-color: #f0fff4;
          opacity: 1;
        }
        .step-icon {
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: 15px;
          border-radius: 50%;
          background-color: #e9ecef;
          color: #6c757d;
        }
        .login-step.active .step-icon {
          background-color: #007bff;
          color: white;
        }
        .login-step.completed .step-icon {
          background-color: #28a745;
          color: white;
        }
        .step-content {
          flex: 1;
        }
        .step-title {
          font-weight: bold;
          margin-bottom: 4px;
        }
        .step-description {
          font-size: 0.85rem;
          color: #6c757d;
        }
        .login-step.active .step-description {
          color: #495057;
        }
        .step-number {
          font-weight: bold;
        }
        .spinner {
          width: 20px;
          height: 20px;
          border: 3px solid rgba(255,255,255,0.3);
          border-radius: 50%;
          border-top-color: white;
          animation: spin 1s ease-in-out infinite;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      </style>
    `;
  }

  closeActiveNotification() {
    Swal.close();
  }

  showToastErrorMessage(message: string) {
    this.openToastSwal('Error', message, 'error');
  }

  showToastSuccessMessage(message: string) {
    this.openToastSwal('Éxito', message, 'success');
  }

  showToastInfoMessage(message: string) {
    this.openToastSwal('Información', message, 'info');
  }

  showErrorMessage(message: string) {
    this.openSwal('Error', message, 'error');
  }

  showSuccessMessage(message: string) {
    this.openSwal('Éxito', message, 'success');
  }

  showInfoMessage(message: string) {
    this.openSwal('Información', message, 'info');
  }

  confirm(
    title: string,
    text: string,
    icon: 'warning' | 'question' = 'question',
    confirmColor: string = '#1AAE9F'
  ): Promise<boolean> {
    return Swal.fire({
      title,
      text,
      icon,
      showCancelButton: true,
      confirmButtonText: 'ACEPTAR',
      cancelButtonText: 'CANCELAR',
      reverseButtons: true,
      focusCancel: true,
      confirmButtonColor: confirmColor // 🔹 aquí se aplica el color
    }).then(result => result.isConfirmed);
  }

}