import { App } from './app/app';
import { appConfig } from './app/app.config';

describe('main.ts', () => {
  it('should have app config defined', () => {
    expect(appConfig).toBeDefined();
  });

  it('should have App component defined', () => {
    expect(App).toBeDefined();
  });

  it('should have app config with providers', () => {
    expect(appConfig.providers).toBeDefined();
  });
});