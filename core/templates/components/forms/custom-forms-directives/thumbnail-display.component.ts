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
 * @fileoverview Component for thumbnail display.
 */

import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { downgradeComponent } from '@angular/upgrade/static';
import { ImageUploadHelperService } from 'services/image-upload-helper.service';

@Component({
  selector: 'oppia-svg-thumbnail-display',
  templateUrl: './thumbnail-display.component.html',
  styleUrls: []
})
export class ThumbnailDisplayComponent implements OnInit, OnChanges {
  constructor(
    private sanitizer: DomSanitizer,
    private imageUploadHelperService: ImageUploadHelperService) {}
  @Input() imgSrc: string;
  @Input() height: string;
  @Input() width: string;
  @Input() classes: unknown;
  @Input() background: string;
  imageSource = null;

  ngOnInit(): void {
    this.checkSVGData();
  }

  /**
   * Angular by default treats svg+xml data as unsafe. In order to show the SVG
   * we need to check the SVG data for possible XSS attacks. The spec file for
   * this component showcases some scenarios where XSS attacks are possible if
   * the SVG is not checked for such attacks. The following function checks the
   * SVG data for possible XSS vulnerabilities.
   */
  checkSVGData(): void {
    // If the SVG image is passed as base64 data.
    if (this.imgSrc.indexOf('data:image/svg+xml;base64') !== -1) {
      // Check for malicious SVG.
      const { tags: invalidTags, attrs: invalidAttributes } = (
        this.imageUploadHelperService.getInvalidSvgTagsAndAttrs(this.imgSrc));

      // If the data is malicious don't display the SVG.
      if (invalidTags.length > 0 || invalidAttributes.length > 0) {
        this.imgSrc = null;
        return;
      }

      // If the the SVG is safe, display the SVG.
      this.imageSource = this.sanitizer.bypassSecurityTrustResourceUrl(
        this.imgSrc);
    } else {
      this.imageSource = this.imgSrc;
    }
  }

  ngOnChanges(): void {
    this.checkSVGData();
  }
}

angular.module('oppia').directive(
  'oppiaSvgThumbnailDisplay', downgradeComponent(
    {component: ThumbnailDisplayComponent}));