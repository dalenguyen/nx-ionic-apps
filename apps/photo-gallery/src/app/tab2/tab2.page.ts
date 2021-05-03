import { Component, OnInit } from '@angular/core'
import { ActionSheetController } from '@ionic/angular'
import { Photo, PhotoService } from '../services/photo.service'

@Component({
  selector: 'apps-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
})
export class Tab2Page implements OnInit {
  constructor(
    public photoService: PhotoService,
    public actionSheetController: ActionSheetController,
  ) {}

  ngOnInit(): void {
    this.photoService.loadSaved()
  }

  addPhotoToGallery() {
    this.photoService.addNewToGallery()
  }

  async showActionSheet(photo: Photo, position: number) {
    try {
      const actionSheet = await this.actionSheetController.create({
        header: 'Photos',
        buttons: [
          {
            text: 'Delete',
            role: 'destructive',
            icon: 'trash',
            handler: () => {
              this.photoService.deletePicture(photo, position)
            },
          },
          {
            text: 'Cancel',
            icon: 'close',
            role: 'cancel',
            handler: () => {
              // do nothing
            },
          },
        ],
      })

      await actionSheet.present()
    } catch (error) {
      console.error(error)
    }
  }
}
