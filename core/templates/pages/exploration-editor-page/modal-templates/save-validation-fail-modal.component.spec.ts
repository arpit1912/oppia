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
 * @fileoverview Unit tests for SaveValidationFailModalController.
 */

import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { WindowRef } from 'services/contextual/window-ref.service';
import { SaveValidationFailModalComponent } from './save-validation-fail-modal.component';

class MockActiveModal {
  dismiss(): void {
    return;
  }

  close(): void {
    return;
  }
}

describe('Save Validation Fail Modal Controller', () => {
  let component: SaveValidationFailModalComponent;
  let fixture: ComponentFixture<SaveValidationFailModalComponent>;
  let ngbActiveModal: NgbActiveModal;
  let windowRef: WindowRef = null;

  beforeEach(()=>{
    TestBed.configureTestingModule({
      declarations: [SaveValidationFailModalComponent],
      providers: [
        {
          provide: NgbActiveModal,
          useClass: MockActiveModal
        },
        WindowRef
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(SaveValidationFailModalComponent);
    component = fixture.componentInstance;
    ngbActiveModal = TestBed.inject(NgbActiveModal);
    windowRef = TestBed.inject(WindowRef);
  });
  it('should refresh page when modal is closed', fakeAsync(() => {
    const reloadSpy = jasmine.createSpy('reload');
    spyOnProperty(windowRef, 'nativeWindow').and.returnValue({
      location: {
        reload: reloadSpy
      }
    });

    component.closeAndRefresh();
    expect(ngbActiveModal.dismiss).toHaveBeenCalledWith('cancel');

    tick();

    expect(reloadSpy).toHaveBeenCalled();
  }));
});
