import { Injectable } from '@angular/core'
import {
  Plugins,
  CameraResultType,
  Capacitor,
  FilesystemDirectory,
  CameraPhoto,
  CameraSource,
} from '@capacitor/core'

export interface Photo {
  filepath: string
  webviewPath: string
}

const { Camera, Filesystem, Storage } = Plugins

@Injectable({
  providedIn: 'root',
})
export class PhotoService {
  photos: Photo[] = []
  private PHOTO_STORATE: string = 'photos'

  constructor() {}

  async addNewToGallery() {
    try {
      const capturedPhoto = await Camera.getPhoto({
        resultType: CameraResultType.Uri,
        source: CameraSource.Camera,
        quality: 100,
      })

      // Save the picture and add it to photo collection
      const savedImageFile = await this._savePicture(capturedPhoto)
      this.photos.unshift(savedImageFile)

      console.log(this.photos)

      Storage.set({
        key: this.PHOTO_STORATE,
        value: JSON.stringify(this.photos),
      })
    } catch (error) {
      console.error(error)
    }
  }

  async loadSaved() {
    try {
      // Retrieve cached photo array data
      const photoList = await Storage.get({ key: this.PHOTO_STORATE })
      this.photos = JSON.parse(photoList.value) || []

      for (const photo of this.photos) {
        const readFile = await Filesystem.readFile({
          path: photo.filepath,
          directory: FilesystemDirectory.Data,
        })

        // web platform only: Load the photo as base64 data
        photo.webviewPath = `data:image/jpeg;base64,${readFile.data}`
      }
    } catch (error) {
      console.error(error)
    }
  }

  private async _savePicture(cameraPhoto: CameraPhoto): Promise<Photo> {
    try {
      // convert photo to base64 format, required by Filesystem API to save
      const base64Data = await this._readAsBase64(cameraPhoto)

      console.log({ base64Data })

      // write the file to the data directory
      const fileName = new Date().getTime() + '.jpeg'
      const savedFile = await Filesystem.writeFile({
        path: fileName,
        data: base64Data,
        directory: FilesystemDirectory.Data,
      })

      return {
        filepath: fileName,
        webviewPath: cameraPhoto.webPath,
      }
    } catch (error) {
      console.error(error)
    }
  }

  private async _readAsBase64(cameraPhoto: CameraPhoto) {
    // Fetch the photo, read as a blob, then convert to base64 format
    const response = await fetch(cameraPhoto.webPath!)
    const blob = await response.blob()

    return (await this.convertBlobToBase64(blob)) as string
  }

  convertBlobToBase64 = (blob: Blob) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onerror = reject
      reader.onload = () => {
        resolve(reader.result)
      }
      reader.readAsDataURL(blob)
    })
}
