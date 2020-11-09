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
 * @fileoverview Unit tests for the Exploration data service.
 */

// TODO(#7222): Remove the following block of unnnecessary imports once
// the code corresponding to the spec is upgraded to Angular 8.
import { importAllAngularServices } from 'tests/unit-test-utils';
// ^^^ This block is to be removed.

import { TestBed, fakeAsync, flushMicrotasks } from '@angular/core/testing';
import { HttpTestingController } from '@angular/common/http/testing';

import { ExplorationDataService } from 'pages/exploration-editor-page/services/exploration-data.service';
import { LocalStorageService} from 'services/local-storage.service';
import { AlertsService } from 'services/alerts.service';
import { LoggerService } from 'services/contextual/logger.service';
import { CsrfTokenService } from 'services/csrf-token.service';

describe('Exploration data service', function() {
  let explorationDataService: ExplorationDataService = null;
  let localStorageService: LocalStorageService = null;
  let loggerService: LoggerService = null;
  let alertService: AlertsService = null;
  let csrfService: CsrfTokenService = null;
  let httpTestingController: HttpTestingController;
  var sampleDataResults = {
    draft_change_list_id: 3,
    version: 1,
    exploration: {
      init_state_name: 'Introduction',
      states: {
        Introduction: {
          param_changes: [],
          content: {
            html: '',
            audio_translations: {}
          },
          unresolved_answers: {},
          interaction: {
            customization_args: {},
            answer_groups: [],
            default_outcome: {
              param_changes: [],
              dest: 'Introduction',
              feedback: {
                html: '',
                audio_translations: {}
              }
            },
            confirmed_unclassified_answers: [],
            id: null
          }
        }
      }
    },
  };
  var windowMock = {
    nativeWindow: {
      location: {
        reload: function() {}
      }
    }
  };

  beforeEach(angular.mock.module('oppia'));
  importAllAngularServices();

  beforeEach(angular.mock.module('oppia', function($provide) {
    $provide.value('UrlService', {
      getPathname: function() {
        return '/create/0';
      }
    });
    $provide.value('WindowRef', windowMock);
  }));

  beforeEach(() => {
    explorationDataService = TestBed.get(ExplorationDataService);
    localStorageService = TestBed.get(LocalStorageService);
    loggerService = TestBed.get(LoggerService);
    alertService = TestBed.get(AlertsService);
    csrfService = TestBed.get(CsrfTokenService);
    httpTestingController = TestBed.get(HttpTestingController);

    spyOn(csrfService, 'getTokenAsync').and.callFake(()=> {
      return Promise.resolve('sample-csrf-token');
    });
  });

  it('should autosave draft changes when draft ids match', fakeAsync(()=> {
    var errorCallback = jasmine.createSpy('error');
    spyOn(localStorageService, 'getExplorationDraft').and.returnValue({
      isValid: function() {
        return true;
      },
      getChanges: function() {
        return [];
      }
    });
    explorationDataService.getData(errorCallback).then(function(data) {
      expect(data).toEqual(sampleDataResults);
      expect(errorCallback).not.toHaveBeenCalled();
    });

    var req = httpTestingController.expectOne(
      '/createhandler/data/0?apply_draft=true');
    expect(req.request.method).toEqual('GET');
    req.flush(sampleDataResults);
    flushMicrotasks();

    req = httpTestingController.expectOne(
      '/createhandler/autosave_draft/0');
    expect(req.request.method).toEqual('PUT');
    req.flush(sampleDataResults);
    flushMicrotasks();
  }));

  it('should not autosave draft changes when draft is already cached',
    fakeAsync(() => {
      var errorCallback = jasmine.createSpy('error');
      spyOn(localStorageService, 'getExplorationDraft').and.returnValue({
        isValid: function() {
          return true;
        },
        getChanges: function() {
          return [];
        }
      });

      // Save draft.
      explorationDataService.getData(errorCallback).then(function(data) {
        expect(data).toEqual(sampleDataResults);
        expect(errorCallback).not.toHaveBeenCalled();
      });

      var req = httpTestingController.expectOne(
        '/createhandler/data/0?apply_draft=true');
      expect(req.request.method).toEqual('GET');
      req.flush(sampleDataResults);
      flushMicrotasks();
      req = httpTestingController.expectOne(
        '/createhandler/autosave_draft/0');
      expect(req.request.method).toEqual('PUT');
      req.flush(sampleDataResults);
      flushMicrotasks();


      var logInfoSpy = spyOn(loggerService, 'info').and.callThrough();
      // Draft is already saved and it's in cache.
      explorationDataService.getData(errorCallback).then(function(data) {
        expect(logInfoSpy).toHaveBeenCalledWith(
          'Found exploration data in cache.');
        expect(data).toEqual(sampleDataResults);
        expect(errorCallback).not.toHaveBeenCalled();
      });
    }));

  it('should autosave draft changes when draft ids match', fakeAsync(() => {
    var errorCallback = jasmine.createSpy('error');
    spyOn(localStorageService, 'getExplorationDraft').and.returnValue({
      isValid: function() {
        return true;
      },
      getChanges: function() {
        return [];
      }
    });
    var windowRefSpy = spyOn(windowMock.nativeWindow.location, 'reload')
      .and.callThrough();
    explorationDataService.getData(errorCallback).then(function(data) {
      expect(data).toEqual(sampleDataResults);
      expect(errorCallback).not.toHaveBeenCalled();
      expect(windowRefSpy).not.toHaveBeenCalled();
    });
    var req = httpTestingController.expectOne(
      '/createhandler/data/0?apply_draft=true');
    expect(req.request.method).toEqual('GET');
    req.flush(sampleDataResults);
    flushMicrotasks();
    req = httpTestingController.expectOne(
      '/createhandler/autosave_draft/0');
    expect(req.request.method).toEqual('PUT');
    req.flush(500);
    flushMicrotasks();
  }));

  it('should call error callback when draft ids do not match', fakeAsync(() => {
    spyOn(localStorageService, 'getExplorationDraft').and.returnValue({
      isValid: function() {
        return false;
      },
      getChanges: function() {
        return [];
      }
    });
    var errorCallback = jasmine.createSpy('error');
    explorationDataService.getData(errorCallback).then(function(data) {
      expect(data).toEqual(sampleDataResults);
      expect(errorCallback).toHaveBeenCalled();
    });

    var req = httpTestingController.expectOne(
      '/createhandler/data/0?apply_draft=true');
    expect(req.request.method).toEqual('GET');
    req.flush(sampleDataResults);
    flushMicrotasks();
  }));

  it('should discard draft', fakeAsync(() => {
    var successHandler = jasmine.createSpy('success');
    var failHandler = jasmine.createSpy('fail');
    explorationDataService.discardDraft(
      successHandler, failHandler);

    var req = httpTestingController.expectOne(
      '/createhandler/autosave_draft/0');
    expect(req.request.method).toEqual('POST');
    req.flush(200);
    flushMicrotasks();

    expect(successHandler).toHaveBeenCalled();
    expect(failHandler).not.toHaveBeenCalled();
  }));

  it('should use reject handler when discard draft fails', fakeAsync(() => {
    var successHandler = jasmine.createSpy('success');
    var errorCallback = jasmine.createSpy('error');

    explorationDataService.discardDraft(
      successHandler, errorCallback);

    var req = httpTestingController.expectOne(
      '/createhandler/autosave_draft/0');
    expect(req.request.method).toEqual('POST');
    req.flush(500);
    flushMicrotasks();

    expect(successHandler).not.toHaveBeenCalled();
    expect(errorCallback).toHaveBeenCalled();
  }));

  it('should get last saved data', fakeAsync(() => {
    var successHandler = jasmine.createSpy('success');
    var failHandler = jasmine.createSpy('fail');
    var logInfoSpy = spyOn(loggerService, 'info').and.callThrough();

    explorationDataService.getLastSavedData().then(successHandler, failHandler);

    let req = httpTestingController.expectOne('/explorehandler/init/0');
    expect(req.request.method).toEqual('GET');
    req.flush(sampleDataResults);
    flushMicrotasks();

    expect(successHandler).toHaveBeenCalledWith(
      sampleDataResults.exploration);
    expect(logInfoSpy).toHaveBeenCalledTimes(2);
  }));

  it('should resolve answers', fakeAsync(() => {
    var stateName = 'First State';
    var clearWarningsSpy = spyOn(
      alertService, 'clearWarnings').and.callThrough();

    explorationDataService.resolveAnswers(stateName, []);
    let req = httpTestingController.expectOne(
      '/createhandler/resolved_answers/0/' + encodeURIComponent(stateName));
    expect(req.request.method).toEqual('PUT');
    req.flush(200);
    flushMicrotasks();

    expect(clearWarningsSpy).toHaveBeenCalled();
  }));

  it('should save an exploration to the backend', fakeAsync(() => {
    var successHandler = jasmine.createSpy('success');
    var failHandler = jasmine.createSpy('fail');

    var errorCallback = jasmine.createSpy('error');
    spyOn(localStorageService, 'getExplorationDraft').and.returnValue({
      isValid: function() {
        return true;
      },
      getChanges: function() {
        return [];
      }
    });
    var changeList = [];
    var response = {
      is_version_of_draft_valid: true,
      draft_changes: ''
    };

    explorationDataService.getData(errorCallback).then(function(data) {
      expect(data).toEqual(sampleDataResults);
      expect(errorCallback).not.toHaveBeenCalled();
    });

    let req = httpTestingController.expectOne(
      '/createhandler/data/0?apply_draft=true');
    expect(req.request.method).toEqual('GET');
    req.flush(sampleDataResults);
    flushMicrotasks();

    req = httpTestingController.expectOne('/createhandler/autosave_draft/0');
    expect(req.request.method).toEqual('PUT');
    req.flush(sampleDataResults);
    flushMicrotasks();

    explorationDataService.save(
      changeList, 'Commit Message', successHandler, failHandler);
    req = httpTestingController.expectOne('/createhandler/data/0');
    expect(req.request.method).toEqual('PUT');
    req.flush(response);
    flushMicrotasks();

    expect(successHandler).toHaveBeenCalledWith(
      response.is_version_of_draft_valid, response.draft_changes);
    expect(failHandler).not.toHaveBeenCalled();
  }));

  it('should save an exploration to the backend even when ' +
    'data.exploration is not defined', fakeAsync(() => {
    var successHandler = jasmine.createSpy('success');
    var failHandler = jasmine.createSpy('fail');

    var errorCallback = jasmine.createSpy('error');
    spyOn(localStorageService, 'getExplorationDraft').and.returnValue({
      isValid: function() {
        return false;
      }
    });
    var changeList = [];
    var response = {
      is_version_of_draft_valid: true,
      draft_changes: ''
    };

    // The data.exploration won't receive a value.
    explorationDataService.getData(errorCallback).then(function() {
      expect(errorCallback).toHaveBeenCalled();
    });
    let req = httpTestingController.expectOne(
      '/createhandler/data/0?apply_draft=true');
    expect(req.request.method).toEqual('GET');
    req.flush(500);
    flushMicrotasks();

    explorationDataService.save(
      changeList, 'Commit Message', successHandler, failHandler);
    req = httpTestingController.expectOne(
      '/createhandler/data/0?apply_draft=true');
    expect(req.request.method).toEqual('PUT');
    req.flush(response);
    flushMicrotasks();

    expect(successHandler).toHaveBeenCalledWith(
      response.is_version_of_draft_valid, response.draft_changes);
    expect(failHandler).not.toHaveBeenCalled();
  }));

  it('should use reject handler when save an exploration to the backend fails',
    fakeAsync(() => {
      var successHandler = jasmine.createSpy('success');
      var failHandler = jasmine.createSpy('fail');

      var errorCallback = jasmine.createSpy('error');
      spyOn(localStorageService, 'getExplorationDraft').and.returnValue({
        isValid: function() {
          return true;
        },
        getChanges: function() {
          return [];
        }
      });
      var changeList = [];
      explorationDataService.getData(errorCallback).then(function(data) {
        expect(data).toEqual(sampleDataResults);
        expect(errorCallback).not.toHaveBeenCalled();
      });

      let req = httpTestingController.expectOne(
        '/createhandler/data/0?apply_draft=true');
      expect(req.request.method).toEqual('GET');
      req.flush(sampleDataResults);
      flushMicrotasks();

      req = httpTestingController.expectOne('/createhandler/autosave_draft/0');
      expect(req.request.method).toEqual('PUT');
      req.flush(sampleDataResults);
      flushMicrotasks();

      explorationDataService.save(
        changeList, 'Commit Message', successHandler, failHandler);
      req = httpTestingController.expectOne('/createhandler/data/0');
      expect(req.request.method).toEqual('PUT');
      req.flush(500);
      flushMicrotasks();

      expect(successHandler).not.toHaveBeenCalled();
      expect(failHandler).toHaveBeenCalled();
    }));
});

describe('Exploration data service', function() {
  let explorationDataService: ExplorationDataService = null;
  let loggerService: LoggerService = null;
  let logErrorSpy;
  let pathname = '/exploration/0';

  beforeEach(angular.mock.module('oppia'));
  importAllAngularServices();

  beforeEach(angular.mock.module('oppia', function($provide) {
    $provide.value('UrlService', {
      getPathname: function() {
        return pathname;
      }
    });
  }));

  beforeEach(() => {
    loggerService = TestBed.get(LoggerService);
    logErrorSpy = spyOn(loggerService, 'error').and.callThrough();
    explorationDataService = TestBed.get(ExplorationDataService);
  });

  it('should throw error when pathname is not valid', fakeAsync(() => {
    expect(logErrorSpy).toHaveBeenCalledWith(
      'Unexpected call to ExplorationDataService for pathname ', pathname);

    var errorCallback = jasmine.createSpy('error');
    expect(function() {
      explorationDataService.getData(errorCallback);
    }).toThrowError('eds.getData is not a function');
  }));
});
