import { Component } from '@angular/core';
import { downgradeComponent } from '@angular/upgrade/static';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { WindowRef } from 'services/contextual/window-ref.service';

@Component({
  selector: 'save-validation-fail-modal',
  templateUrl: './save-validation-fail-modal.template.html',
  styleUrls: []
})
export class SaveValidationFailModalComponent {
  constructor(
  private activeModal: NgbActiveModal,
  private windowRef: WindowRef
  ) {}

  private MSECS_TO_REFRESH:number = 20;

  __refreshPage(delay:number):void {
    setTimeout(()=>{
      this.windowRef.nativeWindow.location.reload();
    }, delay);
  }

  closeAndRefresh():void {
    this.activeModal.dismiss('cancel');
    this.__refreshPage(this.MSECS_TO_REFRESH);
  }
}
angular.module('oppia').directive(
  'saveValidationFailModal', downgradeComponent(
    {component: SaveValidationFailModalComponent}));
