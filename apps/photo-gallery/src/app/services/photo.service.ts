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

  constructor() {}

  async addNewToGallery() {
    try {
      const capturedPhoto = await Camera.getPhoto({
        resultType: CameraResultType.Uri,
        source: CameraSource.Camera,
        quality: 100,
      })

      this.photos.unshift({
        filepath: 'soon...',
        webviewPath: capturedPhoto.webPath,
      })

      // const capturedBased64Photo = await Camera.getPhoto({
      //   resultType: CameraResultType.Base64,
      //   source: CameraSource.Camera,
      //   quality: 100,
      // })

      // console.log({ capturedBased64Photo })
    } catch (error) {
      console.log(error)
    }
  }
}
