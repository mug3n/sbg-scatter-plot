import { SbgScatterPlotPage } from './app.po';

describe('sbg-scatter-plot App', () => {
  let page: SbgScatterPlotPage;

  beforeEach(() => {
    page = new SbgScatterPlotPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
