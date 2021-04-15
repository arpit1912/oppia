// Copyright 2020 The Oppia Authors. All Rights Reserved.
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
 * @fileoverview Controller for non strict validation fail modal.
 */
import { Component } from '@angular/core';
import { downgradeComponent } from '@angular/upgrade/static';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { WindowRef } from 'services/contextual/window-ref.service';

@Component({
  selector: 'save-validation-fail-modal',
  templateUrl: './save-validation-fail-modal.component.html',
  styleUrls: []
})
export class SaveValidationFailModalComponent {
  constructor(
  private activeModal: NgbActiveModal,
  private windowRef: WindowRef
  ) {}

  private MSECS_TO_REFRESH: number = 20;

  private __refreshPage(delay: number): void {
    setTimeout(()=>{
      this.windowRef.nativeWindow.location.reload();
    }, delay);
  }

  closeAndRefresh(): void {
    this.activeModal.dismiss('cancel');
    this.__refreshPage(this.MSECS_TO_REFRESH);
  }
}
angular.module('oppia').directive(
  'saveValidationFailModal', downgradeComponent(
    {component: SaveValidationFailModalComponent}));
