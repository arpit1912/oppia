import { Component, Input } from '@angular/core';
import { downgradeComponent } from '@angular/upgrade/static';
import { LostChangeBackendDict, LostChangeObjectFactory } from 'domain/exploration/LostChangeObjectFactory';
import { LoggerService } from 'services/contextual/logger.service';
import { WindowRef } from 'services/contextual/window-ref.service';
import { ExplorationDataService } from '../services/exploration-data.service';


@Component({
  selector: 'save-version-mismatch-modal',
  templateUrl: './save-version-mismatch-modal.template.html',
  styleUrls: []
})
export class SaveVersionMismatchModalComponent {
  constructor(
  private explorationDataService: ExplorationDataService,
  private windowRef: WindowRef,
  private loggerService: LoggerService,
  private lostChangeObjectFactory: LostChangeObjectFactory
  ) {}

  @Input() lostChanges:LostChangeBackendDict[];

  MSECS_TO_REFRESH: number = 20;

  _refreshPage(delay: number): void {
    setTimeout(() => {
      this.windowRef.nativeWindow.location.reload();
    }, delay);
  }

  discardChanges(): void {
    this.explorationDataService.discardDraft().then(() => {
      this._refreshPage(this.MSECS_TO_REFRESH);
      // HOw to use Apply Async here?
    });

    let hasLostChanges = (this.lostChanges && this.lostChanges.length > 0);

    if (hasLostChanges) {
      let lostChanges = this.lostChanges.map(
        this.lostChangeObjectFactory.createNew);
      this.loggerService.error('Lost changes: ' + JSON.stringify(lostChanges));
    }
  }
}
angular.module('oppia').directive(
  'saveVersionMismatchModal', downgradeComponent(
    {component: SaveVersionMismatchModalComponent}));

