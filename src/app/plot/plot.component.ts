import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import * as d3 from 'd3';
import { ScatterPlotChart } from './chart';

declare const window: any;

export const FILTER_NULL = 'All';

@Component({
    selector: 'app-plot',
    templateUrl: './plot.component.html',
    styleUrls: ['./plot.component.scss']
})
export class PlotComponent implements AfterViewInit {
    @ViewChild('chart') public chartElement: ElementRef;

    public chart: ScatterPlotChart;

    public filterOptions: any = {
        case_gender: [],
        case_disease_type: [],
        case_pathologic_stage: [],
    };

    public filter: any = {
        case_gender: FILTER_NULL,
        case_disease_type: FILTER_NULL,
        case_pathologic_stage: FILTER_NULL,
    };

    public filterData() {
        this.chart.filter(
            d => Object.keys(this.filter).reduce(
                (acc, curr) => acc && (this.filter[curr] === FILTER_NULL || d[curr] === this.filter[curr]), true
            )
        );
    }

    public ngAfterViewInit() {
        this.chart = new ScatterPlotChart(this.chartElement.nativeElement);

        d3.tsv('../assets/tcga-cases.tsv', (error: Error, data: any) => {
            if (error) {
                throw error;
            }

            data.forEach(function (d: any) {
                d.case_days_to_death = parseFloat(d.case_days_to_death);
                d.case_age_at_diagnosis = parseFloat(d.case_age_at_diagnosis);
            });

            this.chart.data(data).render();

            this.filterOptions.case_gender = [FILTER_NULL].concat(this.chart.scale.case_gender.domain());
            this.filterOptions.case_disease_type = [FILTER_NULL].concat(this.chart.scale.case_disease_type.domain());
            this.filterOptions.case_pathologic_stage = [FILTER_NULL].concat(this.chart.scale.case_pathologic_stage.domain());
        });
    }
}
