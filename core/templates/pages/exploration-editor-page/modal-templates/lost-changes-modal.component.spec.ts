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
 * @fileoverview Unit tests for LostChangesModalController.
 */

import { LostChangeBackendDict, LostChangeObjectFactory } from
  'domain/exploration/LostChangeObjectFactory';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UtilsService } from 'services/utils.service';
import { LostChangesModalComponent } from './lost-changes-modal.component';
import { LoggerService } from 'services/contextual/logger.service';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

class MockActiveModal {
  dismiss(): void {
    return;
  }

  close(): void {
    return;
  }
}

<<<<<<< HEAD
fdescribe('Lost Changes Modal Component', () => {
=======
describe('Lost Changes Modal Controller', () => {
>>>>>>> 5a99b1e6c3bb3f094e54d6d3df681fc3647798d2
  let component: LostChangesModalComponent;
  let fixture: ComponentFixture<LostChangesModalComponent>;
  let loggerService: LoggerService = null;
  let logSpy = null;
  const lostChanges: LostChangeBackendDict[] = [{
    cmd: 'add_state',
    state_name: 'State name',
  }];

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [LostChangesModalComponent],
      providers: [
        UtilsService,
        LoggerService,
        LostChangeObjectFactory,
        {
          provide: NgbActiveModal,
          useClass: MockActiveModal
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LostChangesModalComponent);
    component = fixture.componentInstance;
    loggerService = TestBed.inject(LoggerService);

    component.lostChanges = lostChanges;
    fixture.detectChanges();

    logSpy = spyOn(loggerService, 'error').and.callThrough();
  });


  it('should evaluates lostChanges when controller is initialized', () => {
    expect(component.lostChanges[0].cmd).toBe('add_state');
    expect(component.lostChanges[0].state_name).toBe('State name');
    expect(logSpy).toHaveBeenCalledWith(
      'Lost changes: ' + JSON.stringify(lostChanges));
  });
});
