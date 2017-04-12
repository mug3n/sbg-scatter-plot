import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';

import { AppComponent } from './app.component';
import { PlotComponent } from './plot/plot.component';
import { MdCardModule, MdGridListModule, MdSelectModule } from '@angular/material';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

@NgModule({
    declarations: [
        AppComponent,
        PlotComponent
    ],
    imports: [
        BrowserModule,
        FormsModule,
        HttpModule,
        MdCardModule,
        MdGridListModule,
        MdSelectModule,
        BrowserAnimationsModule
    ],
    providers: [],
    bootstrap: [AppComponent]
})
export class AppModule {
}
