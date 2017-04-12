import * as d3 from 'd3';
import { DSVParsedArray } from 'd3-dsv';

export type Gender = 'MALE' | 'FEMALE';

export interface Case {
    case_id: string;
    case_gender: Gender;
    case_disease_type: string;
    case_pathologic_stage: string;
    case_age_at_diagnosis: number;
    case_days_to_death: number;
}

export abstract class Chart {
    public width: number = this.svg.parentElement.offsetWidth;
    public height: number = this.svg.parentElement.offsetHeight;

    public element: any;

    public abstract render(data: DSVParsedArray<any>): void;

    constructor(private svg: any) {
        this.element = d3.select(svg)
                         .attr('width', this.width)
                         .attr('height', this.height);
    }
}

export class ScatterPlotChart extends Chart {
    private _data: DSVParsedArray<Case>;

    public margin: any = {
        top: 30,
        right: 30,
        bottom: 50,
        left: 30
    };

    public wrap = 50;

    public width: number = this.width - this.wrap;
    public height: number = this.height - this.margin.top - this.margin.bottom - this.wrap;

    public scale: any = {
        x: d3.scaleLinear().range([0, this.width]),
        y: d3.scaleLinear().range([this.height, 0]),
        scope: d3.scaleLinear().range([0, this.width]),
        case_pathologic_stage: d3.scaleOrdinal(d3.schemeCategory10),
        case_disease_type: d3.scaleOrdinal(d3.schemeCategory10),
        case_gender: d3.scaleOrdinal(d3.schemeCategory10)
    };

    public axis: any = {
        x: d3.axisBottom(null).scale(this.scale.x),
        y: d3.axisLeft(null).scale(this.scale.y),
        scope: d3.axisBottom(this.scale.scope)
    };

    public cases: d3.Selection<any, any, any, any>;
    public scope: d3.Selection<any, any, any, any>;
    public brush: d3.Selection<any, any, any, any>;

    private _filter: (d: Case) => boolean = () => true;

    constructor(svg) {
        super(svg);

        this.element.attr('width', this.width + this.margin.left + this.margin.right)
            .attr('height', this.height + this.margin.top + this.margin.bottom)
            .attr('transform', 'translate(0, 0)');
    }

    public filter(filter: (d: Case) => boolean) {
        this._filter = filter;

        return this.render();
    }

    public data(data: DSVParsedArray<Case>) {
        this._data = data;

        return this;
    }

    public render() {
        let legend, shapes, data: Case[], brush;

        data = this._data.filter(this._filter);

        this.element.selectAll('g').remove();

        this.scale.x.domain(d3.extent(data, d => d.case_days_to_death)).nice();
        this.scale.scope.domain(this.scale.x.domain()).nice();
        this.scale.y.domain(d3.extent(data, d => d.case_age_at_diagnosis)).nice();
        this.scale.case_pathologic_stage.domain(d3.map(data, d => d.case_pathologic_stage).keys());
        this.scale.case_disease_type.domain(d3.map(data, d => d.case_disease_type).keys());
        this.scale.case_gender.domain(d3.map(data, d => d.case_gender).keys());

        this.cases = this.element
                         .append('g')
                         .attr('id', 'cases')
                         .attr('transform', `translate(${this.margin.left}, ${this.margin.top})`);

        this.cases
            .attr('clip-path', 'url(#clip)')
            .attr('height', this.height + 10)
            .attr('width', this.width + this.margin.left + this.margin.right + 20)
            .append('clipPath')
            .attr('id', 'clip')
            .append('rect')
            .attr('transform', 'translate(0, -10)')
            .attr('height', this.height + 10)
            .attr('width', this.width);

        this.scope = this.element
                         .append('g')
                         .attr('id', 'scope')
                         .attr('height', 30)
                         .attr('width', this.width)
                         .style('stroke', 'black')
                         .attr('transform', `translate(${this.margin.left}, ${(this.height + this.margin.bottom + 10)})`);

        this.brush = this.scope
                         .append('g')
                         .attr('id', 'brush')
                         .attr('height', 30)
                         .attr('width', this.width)
                         .attr('transform', 'translate(0, 0)');

        brush = d3
            .brushX()
            .extent([[0, 0], [this.width, this.wrap]])
            .on('start brush end', () => {
                const selection = d3.event.selection;

                if (!selection) {
                    return;
                }

                this.scale.x.domain(selection.map(this.scale.scope.invert, this.scale.scope));
                this.cases.selectAll('.case')
                    .attr('transform',
                        (d: Case) => `translate(${this.scale.x(d.case_days_to_death)}, ${this.scale.y(d.case_age_at_diagnosis)})`
                    );
                this.element.select('g.x.axis').call(this.axis.x);
            });
        this.brush.call(brush)
            .call(brush.move, this.scale.x.range());

        this.scope.append('g')
            .call(this.axis.scope)
            .attr('width', this.width)
            .attr('transform', 'translate(0, 50)');


        this.element.append('g')
            .attr('class', 'x axis')
            .attr('transform', `translate(${this.margin.left},${(this.height + this.margin.top)})`)
            .call(this.axis.x)
            .append('text')
            .attr('class', 'label')
            .attr('x', this.width)
            .attr('y', -6)
            .style('text-anchor', 'end')
            .text('Days to death');

        this.element.append('g')
            .attr('class', 'y axis')
            .attr('transform', `translate(${this.margin.left}, ${this.margin.top})`)
            .call(this.axis.y)
            .append('text')
            .attr('class', 'label')
            .attr('y', 6)
            .style('text-anchor', 'end')
            .text('Age at diagnosis');

        shapes = this.cases.selectAll('.case')
                     .data(data)
                     .enter();

        shapes.filter((d: any) => d.case_gender === 'FEMALE')
              .append('path')
              .attr('d', d3.symbol().size(10 * 10).type(d3.symbolSquare))
              .attr('class', 'case')
              .attr('transform',
                  (d: Case) => `translate(${this.scale.x(d.case_days_to_death)}, ${this.scale.y(d.case_age_at_diagnosis)})`)
              .style('fill', 'transparent')
              .style('stroke', (d: Case) => this.scale.case_pathologic_stage(d.case_pathologic_stage));

        shapes.filter((d: any) => d.case_gender === 'MALE')
              .append('path')
              .attr('d', d3.symbol().size(10 * 10).type(d3.symbolTriangle))
              .attr('class', 'case')
              .attr('transform',
                  (d: Case) => `translate(${this.scale.x(d.case_days_to_death)}, ${this.scale.y(d.case_age_at_diagnosis)})`)
              .style('fill', 'transparent')
              .style('stroke', (d: Case) => this.scale.case_pathologic_stage(d.case_pathologic_stage));

        legend = this.cases
                     .selectAll('.legend--stage')
                     .data(this.scale.case_pathologic_stage.domain())
                     .enter().append('g')
                     .attr('class', 'legend--stage')
                     .attr('transform', (d, i) => {
                         return 'translate(0,' + i * 20 + ')';
                     });

        legend.append('rect')
              .attr('x', this.width - 18)
              .attr('width', 18)
              .attr('height', 18)
              .style('fill', this.scale.case_pathologic_stage);

        legend.append('text')
              .attr('x', this.width - 24)
              .attr('y', 9)
              .attr('dy', '.35em')
              .style('text-anchor', 'end')
              .text((d: any) => {
                  return d;
              });

        legend = this.cases.selectAll('.legend--gender')
                     .data(this.scale.case_gender.domain())
                     .enter().append('g')
                     .attr('class', 'legend--gender')
                     .attr('transform', (d, i) => `translate(0, ${(this.scale.case_pathologic_stage.domain().length + i) * 20})`);

        legend.each(
            (d, i, selection) => {
                d3.select(selection[i]).append('path')
                  .attr('d', d === 'MALE' ?
                      d3.symbol().size(10 * 10).type(d3.symbolTriangle) :
                      d3.symbol().size(12 * 12).type(d3.symbolSquare)
                  )
                  .attr('transform', `translate(${this.width - 9}, ${d === 'MALE' ? 12 : 10})`)
                  .style('fill', 'transparent')
                  .style('stroke', 'black');
            }
        );

        legend.append('text')
              .attr('x', this.width - 24)
              .attr('y', 10)
              .attr('dy', '.35em')
              .style('text-anchor', 'end')
              .text((d: any) => {
                  return d;
              });
    }
}
