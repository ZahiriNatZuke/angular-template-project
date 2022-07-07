import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HideSelectedPipe, SaveDomPipe } from '@core/pipes';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';


@NgModule({
  declarations: [
    SaveDomPipe,
    HideSelectedPipe
  ],
  imports: [
    CommonModule,
    TranslateModule,
    FormsModule,
    RouterModule,
    ReactiveFormsModule
  ],
  exports: [
    SaveDomPipe,
    HideSelectedPipe
  ]
})
export class CoreModule {
}
