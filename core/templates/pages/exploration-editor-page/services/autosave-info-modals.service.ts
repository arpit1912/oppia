// Copyright 2014 The Oppia Authors. All Rights Reserved.
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
 * @fileoverview Service for displaying different types of modals depending
 * on the type of response received as a result of the autosaving request.
 */
import { Injectable } from '@angular/core';
import { downgradeInjectable } from '@angular/upgrade/static';

import { LocalStorageService } from 'services/local-storage.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { LostChangeBackendDict } from 'domain/exploration/LostChangeObjectFactory';

import { SaveValidationFailModalComponent } from '../modal-templates/save-validation-fail-modal.component';
<<<<<<< HEAD
import { SaveVersionMismatchModalComponent } from '../modal-templates/save-version-mismatch-modal.component';
=======
import { SaveVersionMismatchModalComponent } from '../modal-templates/save-version-mismatch-modal.controller';
>>>>>>> 5a99b1e6c3bb3f094e54d6d3df681fc3647798d2
import { LostChangesModalComponent } from '../modal-templates/lost-changes-modal.component';

@Injectable({
  providedIn: 'root'
})
export class AutosaveInfoModalsService {
  constructor(
      private ngbModal: NgbModal,
      private localStorageService: LocalStorageService
  ) {}

  private _isModalOpen: boolean = false;

  showNonStrictValidationFailModal(): void {
    this.ngbModal.open(
      SaveValidationFailModalComponent, {
        backdrop: 'static'
      }
    ).result.then(() => {
      this._isModalOpen = false;
    }, () => {
      this._isModalOpen = true;
    });

    this._isModalOpen = true;
  }

  isModalOpen(): boolean {
    return this._isModalOpen;
  }

  showVersionMismatchModal(lostChanges: LostChangeBackendDict[]): void {
    const modalRef = this.ngbModal.open(
      SaveVersionMismatchModalComponent, {
        backdrop: 'static',
        windowClass: 'oppia-autosave-version-mismatch-modal'
      }
    );

    modalRef.componentInstance.lostChanges = lostChanges;
    modalRef.result.then(() => {
      this._isModalOpen = false;
    }, () => {
      this._isModalOpen = false;
    });

    this._isModalOpen = true;
  }

  showLostChangesModal(
      lostChanges: LostChangeBackendDict[], explorationId: string): void {
    const modalRef = this.ngbModal.open(
      LostChangesModalComponent, {
        backdrop: 'static',
        windowClass: 'oppia-lost-changes-modal'
      });
    modalRef.componentInstance.lostChanges = lostChanges;
    modalRef.result.then(() => {
      this._isModalOpen = false;
    }, () => {
      // When the user clicks on discard changes button, signal backend
      // to discard the draft and reload the page thereafter.
      this.localStorageService.removeExplorationDraft(explorationId);
      this._isModalOpen = false;
    });
    this._isModalOpen = true;
  }
}
angular.module('oppia').factory(
  'AutosaveInfoModalsService', downgradeInjectable(AutosaveInfoModalsService));
