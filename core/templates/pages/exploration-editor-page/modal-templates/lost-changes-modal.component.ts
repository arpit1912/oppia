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
 * @fileoverview Controller for lost changes modal.
 */

import { Component, Input, OnInit } from '@angular/core';
import { downgradeComponent } from '@angular/upgrade/static';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ConfirmOrCancelModal } from 'components/common-layout-directives/common-elements/confirm-or-cancel-modal.component';
import { LostChangeBackendDict, LostChangeObjectFactory } from 'domain/exploration/LostChangeObjectFactory';
import { LoggerService } from 'services/contextual/logger.service';

<<<<<<< HEAD
@Component({
  selector: 'lost-changes-modal-component',
  templateUrl: './lost-changes-modal.component.html',
=======

@Component({
  selector: 'lost-changes-modal-component',
  templateUrl: './lost-changes-modal.template.html',
>>>>>>> 5a99b1e6c3bb3f094e54d6d3df681fc3647798d2
  styleUrls: []
})
export class LostChangesModalComponent
  extends ConfirmOrCancelModal implements OnInit {
  @Input() lostChanges: LostChangeBackendDict[];

  constructor(
<<<<<<< HEAD
    
=======
>>>>>>> 5a99b1e6c3bb3f094e54d6d3df681fc3647798d2
        private loggerService: LoggerService,
        private lostChangeObjectFactory: LostChangeObjectFactory,
        protected ngbInstance: NgbActiveModal
  ) {
    super(ngbInstance);
  }

  ngOnInit(): void {
    this.lostChanges.map(
      this.lostChangeObjectFactory.createNew
    );
    this.loggerService.error(
      'Lost changes: ' + JSON.stringify(this.lostChanges));
  }
}
angular.module('oppia').directive(
  'lostChangesModalComponent', downgradeComponent(
    {component: LostChangesModalComponent}));
