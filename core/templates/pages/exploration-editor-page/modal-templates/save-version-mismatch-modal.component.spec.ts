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
 * @fileoverview Unit tests for SaveVersionMismatchModalController.
 */

import { LostChangeBackendDict, LostChangeObjectFactory } from
  'domain/exploration/LostChangeObjectFactory';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { UtilsService } from 'services/utils.service';
import { WindowRef } from 'services/contextual/window-ref.service';
import { SaveVersionMismatchModalComponent } from './save-version-mismatch-modal.controller';
import { LoggerService } from 'services/contextual/logger.service';
import { ExplorationDataService } from '../services/exploration-data.service';

describe('Save Version Mismatch Modal Controller', () => {
  let component: SaveVersionMismatchModalComponent;
  let fixture: ComponentFixture<SaveVersionMismatchModalComponent>;
  let windowRef: WindowRef = null;
  let loggerService: LoggerService = null;
  const mockExplorationData = {
    discardDraft: (callback) => callback()
  };
  const lostChanges:LostChangeBackendDict[] = [{
    cmd: 'add_state',
    state_name: 'State name',
  }];

  beforeEach(function() {
    TestBed.configureTestingModule({
      declarations: [SaveVersionMismatchModalComponent],
      providers: [
        UtilsService,
        WindowRef,
        ExplorationDataService,
        LoggerService,
        LostChangeObjectFactory
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(SaveVersionMismatchModalComponent);
    component = fixture.componentInstance;
    windowRef = TestBed.inject(WindowRef);
    loggerService = TestBed.inject(LoggerService);

    component.lostChanges = lostChanges;
    fixture.detectChanges();
  });

  it('should evaluates lostChanges when controller is initialized', () => {
    expect(component.lostChanges[0].cmd).toBe('add_state');
    expect(component.lostChanges[0].state_name).toBe('State name');

    let logSpy = spyOn(loggerService, 'error').and.callThrough();

    expect(logSpy).toHaveBeenCalledWith(
      'Lost changes: ' + JSON.stringify(lostChanges));
  });

  it('should remove exploration draft from local storage when modal is closed',
    fakeAsync(() => {
      const reloadSpy = jasmine.createSpy('reload');
      spyOnProperty(windowRef, 'nativeWindow').and.returnValue({
        location: {
          reload: reloadSpy
        }
      });
      const discardDraftSpy = (
        spyOn(mockExplorationData, 'discardDraft').and.callFake(
          () => {
            return new Promise((resolve) => {
              resolve('sample-csrf-token');
            });
          }
        ));

      component.discardChanges();
      fixture.detectChanges();
      expect(discardDraftSpy).toHaveBeenCalled();
      tick();
      expect(reloadSpy).toHaveBeenCalled();
    }));
});