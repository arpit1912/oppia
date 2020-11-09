/* eslint-disable oppia/no-multiline-disable */
/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
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
 * @fileoverview Service for handling all interactions
 * with the exploration editor backend.
 */

import { Injectable } from '@angular/core';
import { downgradeInjectable } from '@angular/upgrade/static';

import { HttpClient } from '@angular/common/http';
import { WindowRef } from 'services/contextual/window-ref.service';
import { EditableExplorationBackendApiService } from
  'domain/exploration/editable-exploration-backend-api.service';
import { ReadOnlyExplorationBackendApiService, ReadOnlyExplorationBackendDict } from
  'domain/exploration/read-only-exploration-backend-api.service';
import { AlertsService } from 'services/alerts.service';
import { LoggerService } from 'services/contextual/logger.service';
import { LocalStorageService } from 'services/local-storage.service';
import { UrlService } from 'services/contextual/url.service';
import { ExplorationChangeList } from 'domain/exploration/exploration-draft.model';
import {ExplorationBackendDict} from 'domain/exploration/ExplorationObjectFactory';
import { boolean } from 'mathjs';


interface ExplorationAutosaveChangeListResponse{
  draft_change_list_id: number
}
interface saveResponse {
  is_version_of_draft_valid: boolean,
  draft_changes: string[]
}
export interface DraftExplorationResponse{
  draft_change_list_id: number,
  version: number,
  exploration: ExplorationBackendDict
}

@Injectable({
  providedIn: 'root'
})
export class ExplorationDataService {
  resolvedAnswersUrlPrefix = null;
  explorationDraftAutosaveUrl = null;
  constructor(
    private editableExplorationBackendApiService:
    EditableExplorationBackendApiService,
    private readOnlyExplorationBackendApiService:
    ReadOnlyExplorationBackendApiService,
    private alertsService: AlertsService,
    private localStorageService: LocalStorageService,
    private urlService: UrlService,
    private windowRef: WindowRef,
    private httpClient: HttpClient,
    private loggerService: LoggerService,
    private explorationId: string,
    private pathname: string,
    private pathnameArray: string[],
    private draftChangeListId: number,
    private explorationData
  ) {
    explorationId = '';
    draftChangeListId = null;
    pathname = this.urlService.getPathname();
    pathnameArray = pathname.split('/');
    for (let i = 0; i < pathnameArray.length; i++) {
      if (pathnameArray[i] === 'create') {
        explorationId = pathnameArray[i + 1];
        break;
      }
    }

    if (!explorationId) {
      this.loggerService.error(
        'Unexpected call to ExplorationDataService for pathname ' + pathname);
      // Note: if we do not return anything, Karma unit tests fail.
    }

    explorationData = {
      explorationId: explorationId,
      data: null
    };

    this.resolvedAnswersUrlPrefix = (
      '/createhandler/resolved_answers/' + explorationId);
    this.explorationDraftAutosaveUrl = (
      '/createhandler/autosave_draft/' + explorationId);
  }

  autosaveChangeList(
      changeList: ExplorationChangeList[],
      successCallback: (value: unknown) => void,
      errorCallback: (reason?: string) => void)
    : Promise<unknown> {
    return new Promise((resolve, reject) => {
    // First save locally to be retrieved later if save is unsuccessful.
      this.localStorageService.saveExplorationDraft(
        this.explorationId, changeList, this.draftChangeListId);
      this.httpClient.put<ExplorationAutosaveChangeListResponse>(
        this.explorationDraftAutosaveUrl, {
          change_list: changeList,
          version: this.explorationData.data.version
        }).toPromise().then(response => {
        this.draftChangeListId = response.draft_change_list_id;
        // We can safely remove the locally saved draft copy if it was saved
        // to the backend.
        this.localStorageService.removeExplorationDraft(this.explorationId);
        successCallback(response);
      }, errorResponse => {
        errorCallback();
      });
    });
  }
  discardDraft(
      successCallback: (value?: unknown) => void,
      errorCallback: (reason?: string) => void)
    : Promise<unknown> {
    return new Promise((resolve, reject) => {
      this.httpClient.post(
        this.explorationDraftAutosaveUrl, {}).toPromise().then(response => {
        this.localStorageService.removeExplorationDraft(this.explorationId);
        successCallback();
      }, errorResponse => {
        errorCallback();
      });
    });
  }
  // Returns a promise that supplies the data for the current exploration.
  getData(errorCallback: (reason?: string) => void)
  : Promise<unknown> {
    return new Promise((resolve, reject) => {
      if (this.explorationData.data) {
        this.loggerService.info('Found exploration data in cache.');
        return new Promise((resolve, reject) => {
          resolve(this.explorationData.data);
        });
      } else {
      // Retrieve data from the server.
      // WARNING: Note that this is a version of the exploration with draft
      // changes applied. This makes a force-refresh necessary when changes
      // are discarded, otherwise the exploration-with-draft-changes
      // (which is cached here) will be reused.
        return (
          this.editableExplorationBackendApiService.fetchApplyDraftExploration(
            this.explorationId).then(response => {
            this.loggerService.info('Retrieved exploration data.');
            this.loggerService.info(response);
            this.draftChangeListId = response.draft_change_list_id;
            this.explorationData.data = response;
            let draft = this.localStorageService.getExplorationDraft(
              this.explorationId);
            if (draft) {
              if (draft.isValid(this.draftChangeListId)) {
                let changeList = draft.getChanges();
                this.explorationData.autosaveChangeList(changeList, function() {
                // A reload is needed so that the changelist just saved is
                // loaded as opposed to the exploration returned by this
                // response.
                  this.windowRef.nativeWindow.location.reload();
                });
              } else {
                if (errorCallback) {
                  errorCallback(this.explorationId, draft.getChanges());
                }
              }
            }
            return response;
          }, errorResponse => {
            errorCallback(errorResponse.error.error);
          }));
      }
    });
  }
  // Returns a promise supplying the last saved version for the current
  // exploration.
  getLastSavedData(): Promise<ReadOnlyExplorationBackendDict> {
    return this.readOnlyExplorationBackendApiService.loadLatestExploration(
      this.explorationId).then(function(response) {
      this.loggerService.info('Retrieved saved exploration data.');
      this.loggerService.info(response);

      return response.exploration;
    });
  }
  resolveAnswers(
      stateName: string,
      resolvedAnswersList: string[]): void {
    this.alertsService.clearWarnings();
    this.httpClient.put(
      this.resolvedAnswersUrlPrefix + '/' + encodeURIComponent(stateName), {
        resolved_answers: resolvedAnswersList
      }
    );
  }
  /**
   * Saves the exploration to the backend, and, on a success callback,
   * updates the local copy of the exploration data.
   * @param {object} changeList - Represents the change list for
   *   this save. Each element of the list is a command representing an
   *   editing action (such as add state, delete state, etc.). See the
   *  _'Change' class in exp_services.py for full documentation.
   * @param {string} commitMessage - The user-entered commit message for
   *   this save operation.
   */
  save(
      changeList: string[],
      commitMessage: string,
      successCallback: (value: saveResponse) => void,
      errorCallback: (reason?: string) => void)
    : Promise<saveResponse> {
    return new Promise((resolve, reject) => {
      this.editableExplorationBackendApiService.updateExploration(
        this.explorationId,
        this.explorationData.data ? this.explorationData.data.version : null,
        commitMessage, changeList).then(
        response => {
          this.alertsService.clearWarnings();
          this.explorationData.data = response;
          successCallback(
            {
              is_version_of_draft_valid: response.is_version_of_draft_valid,
              draft_changes: response.draft_changes
            });
        }, errorResponse => {
          errorCallback();
        }
      );
    });
  }
}

angular.module('oppia').factory(
  'ExplorationDataService', downgradeInjectable(ExplorationDataService)
);
