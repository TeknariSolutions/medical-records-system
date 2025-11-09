import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { EpsUseCase } from 'src/app/infrastructure/use-cases/common/eps.use-case';
import { GenerateRipsUseCase } from 'src/app/infrastructure/use-cases/app/generate-rips.use-case';
import { NotificationsService } from 'src/app/infrastructure/services/common/notifications/notifications.service';
import { DateTimeHelper } from 'src/app/infrastructure/helpers/date-time.helper';
import { LoadingComponent } from 'src/app/presentation/common/loading/loading.component';
import { NgSelectModule } from '@ng-select/ng-select';

@Component({
  selector: 'app-rips-list',
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule,
    LoadingComponent,
    NgSelectModule
  ],
  templateUrl: './rips-list.component.html',
  styleUrl: './rips-list.component.css'
})
export class RipsListComponent implements OnInit {

  isLoading: boolean = false;

  form!: FormGroup;
  epsList: any[] = [];
  today: string = new Date().toISOString().split('T')[0]; // yyyy-MM-dd

  constructor(
    private fb: FormBuilder,
    private _epsUseCase: EpsUseCase,
    private _generateRipsUseCase: GenerateRipsUseCase,
    private _notificationService: NotificationsService
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      idEps: [null, Validators.required],
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
    });

    this.loadEPS();
  }

  loadEPS(): void {
    this._epsUseCase.GetEps('').subscribe({
      next: (data) => (this.epsList = data),
      error: (err) => console.error('Error al cargar EPS:', err)
    });
  }

  
  // Convierte un string yyyy-MM-dd a formato dd-MM-yyyy
 
  private formatDateForApi(dateStr: string): string {
    const [year, month, day] = dateStr.split('-');
    return `${day}-${month}-${year}`;
  }

  generateRips(): void {
    if (this.form.invalid) {
      this._notificationService.showToastErrorMessage('Debe completar todos los campos.');
      this.form.markAllAsTouched();
      return;
    }

    const { idEps, startDate, endDate } = this.form.value;
    const currentDate = new Date();

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (end > currentDate) {
      this._notificationService.showToastErrorMessage('La fecha final no puede ser superior a la actual.');
      return;
    }

    if (start > end) {
      this._notificationService.showToastErrorMessage('La fecha de inicio no puede ser mayor que la fecha final.');
      return;
    }

    const formattedStart = this.formatDateForApi(startDate);
    const formattedEnd = this.formatDateForApi(endDate);

    this.isLoading = true;

    this._generateRipsUseCase.GenerateRips(idEps, formattedStart as any, formattedEnd as any).subscribe({
      next: (response: any) => {
        this.isLoading = false;

        const message = response?.message ?? 'Error desconocido';

        // Si el backend indica error o no hay data
        if (!response?.isSuccess || !response?.data) {
          this._notificationService.showToastErrorMessage(message);
          return;
        }

        try {
          const jsonContent =
            typeof response.data === 'string'
              ? response.data
              : JSON.stringify(response.data, null, 2);

          const blob = new Blob([jsonContent], { type: 'application/json' });
          const url = window.URL.createObjectURL(blob);

          const a = document.createElement('a');
          a.href = url;
          a.download = `RIPS_${idEps}_${DateTimeHelper.getLocalDateTimeWithOffset().split('T')[0]}.json`;
          a.click();
          window.URL.revokeObjectURL(url);

          this._notificationService.showToastSuccessMessage(message);

          // Limpiar formulario después de generar el archivo
          this.form.reset();
          this.form.markAsPristine();
          this.form.markAsUntouched();
        } catch (err) {
          console.error('Error procesando el archivo RIPS:', err);
          this._notificationService.showToastErrorMessage(message);
        }
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Error al generar RIPS:', err);
        const backendMessage = err?.error?.message ?? 'Error en la generación del RIPS.';
        this._notificationService.showToastErrorMessage(backendMessage);
      }
    });
  }



}
