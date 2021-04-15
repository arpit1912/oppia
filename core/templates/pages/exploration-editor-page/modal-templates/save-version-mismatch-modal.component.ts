// Copyright 2021 The Oppia Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview Controller for version mismatch modal.
 */

import { Component, Input } from '@angular/core';
import { downgradeComponent } from '@angular/upgrade/static';

import { LostChangeBackendDict, LostChangeObjectFactory } from 'domain/exploration/LostChangeObjectFactory';
import { LoggerService } from 'services/contextual/logger.service';
import { WindowRef } from 'services/contextual/window-ref.service';
import { ExplorationDataService } from '../services/exploration-data.service';


@Component({
  selector: 'save-version-mismatch-modal',
  templateUrl: './save-version-mismatch-modal.component.html',
  styleUrls: []
})
export class SaveVersionMismatchModalComponent {
  constructor(
  private explorationDataService: ExplorationDataService,
  private windowRef: WindowRef,
  private loggerService: LoggerService,
  private lostChangeObjectFactory: LostChangeObjectFactory
  ) {}

  @Input() lostChanges: LostChangeBackendDict[];

  MSECS_TO_REFRESH: number = 20;

  _refreshPage(delay: number): void {
    setTimeout(() => {
      this.windowRef.nativeWindow.location.reload();
    }, delay);
  }

  discardChanges(): void {
    this.explorationDataService.discardDraft().then(() => {
      this._refreshPage(this.MSECS_TO_REFRESH);
    });

    var hasLostChanges = (this.lostChanges && this.lostChanges.length > 0);

    if (hasLostChanges) {
      var lostChanges = this.lostChanges.map(
        this.lostChangeObjectFactory.createNew);
      this.loggerService.error('Lost changes: ' + JSON.stringify(lostChanges));
    }
  }
}
angular.module('oppia').directive(
  'saveVersionMismatchModal', downgradeComponent(
    {component: SaveVersionMismatchModalComponent}));
