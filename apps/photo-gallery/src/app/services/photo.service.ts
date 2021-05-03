import { Injectable } from '@angular/core'
import {
  Plugins,
  CameraResultType,
  Capacitor,
  FilesystemDirectory,
  CameraPhoto,
  CameraSource,
} from '@capacitor/core'
import { Platform } from '@ionic/angular'

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
  private platform: Platform

  constructor(platform: Platform) {
    this.platform = platform
    console.log('isHybrid', this.platform.is('hybrid'))
  }

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

      // Easiest way to detect when running on the web:
      // "When the platform is NOT hybrid, do this"
      if (!this.platform.is('hybrid')) {
        for (const photo of this.photos) {
          const readFile = await Filesystem.readFile({
            path: photo.filepath,
            directory: FilesystemDirectory.Data,
          })

          // web platform only: Load the photo as base64 data
          photo.webviewPath = `data:image/jpeg;base64,${readFile.data}`
        }
      }
    } catch (error) {
      console.error(error)
    }
  }

  private async _savePicture(cameraPhoto: CameraPhoto): Promise<Photo> {
    try {
      // convert photo to base64 format, required by Filesystem API to save
      const base64Data = await this._readAsBase64(cameraPhoto)

      // write the file to the data directory
      const fileName = new Date().getTime() + '.jpeg'
      const savedFile = await Filesystem.writeFile({
        path: fileName,
        data: base64Data,
        directory: FilesystemDirectory.Data,
      })

      if (this.platform.is('hybrid')) {
        // Display the new image by rewriting the 'file://' path to HTTP
        // Details: https://ionicframework.com/docs/building/webview#file-protocol
        return {
          filepath: savedFile.uri,
          webviewPath: Capacitor.convertFileSrc(savedFile.uri),
        }
      } else {
        // Use webPath to display the new image instead of base64 since it's
        // already loaded into memory
        return {
          filepath: fileName,
          webviewPath: cameraPhoto.webPath,
        }
      }
    } catch (error) {
      console.error(error)
    }
  }

  async deletePicture(photo: Photo, position: number) {
    try {
      // Remove this photo from the Photos reference data array
      this.photos.splice(position, 1)

      // Update photos array cache by overwriting the existing photo arrays
      Storage.set({
        key: this.PHOTO_STORATE,
        value: JSON.stringify(this.photos),
      })

      // delete photo file from filesystem
      const fileName = photo.filepath.substr(
        photo.filepath.lastIndexOf('/') + 1,
      )

      await Filesystem.deleteFile({
        path: fileName,
        directory: FilesystemDirectory.Data,
      })
    } catch (error) {
      console.error(error)
    }
  }

  private async _readAsBase64(cameraPhoto: CameraPhoto) {
    try {
      // "hybrid" will detect Cordova or Capacitor
      if (this.platform.is('hybrid')) {
        // Read the file into base64 format
        const file = await Filesystem.readFile({
          path: cameraPhoto.path,
        })
        return file.data
      } else {
        // Fetch the photo, read as a blob, then convert to base64 format
        const response = await fetch(cameraPhoto.webPath!)
        const blob = await response.blob()

        return (await this.convertBlobToBase64(blob)) as string
      }
    } catch (error) {
      console.error(error)
    }
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
