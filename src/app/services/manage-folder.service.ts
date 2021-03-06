import {TextObject} from './../interfaces/text-object';
import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';

import {Constants} from '../constants';
import {AuthenticationService} from './authentication.service';

interface User {
  'id': number,
  'username': string,
  'education': string,
  'gender': string,
  'birth_year': number,
  'languages': number[],
  'country': null
}

@Injectable({
  providedIn: 'root',
})

export class ManageFolderService {

  constructor(
    private http: HttpClient,
    public authenticationService: AuthenticationService) { }

  SERVER_URL = Constants.SERVER_URL;


  getFolderInfoFor(folderId: string): Observable<object> {
    const url = new URL(`${this.SERVER_URL}/api/folders/${folderId}/`);

    return this.http.get(url.toString());
  }

  getSubfolderListFor(folderId: string): Observable<object> {
    let urlStr = `${this.SERVER_URL}/api/folders/`;
    if (folderId) {
      urlStr += folderId + '/';
    }
    const url = new URL(urlStr);
    return this.http.get(url.toString());
  }

  getTextListFor(folderId: string): Observable<object> {
    const url = new URL(`${this.SERVER_URL}/api/pub/texts/`);
    url.searchParams.append('sharedfolder', folderId);

    return this.http.get(url.toString());
  }

  createFolder(parentId: string, folderName: string) {
    const url = new URL(`${this.SERVER_URL}/api/folders/`);

    return this.http.post(url.toString(),
        {
          parent: parentId,
          name: folderName,
        },
    );
  }

  deleteFolder(folderId: string) {
    const url = new URL(`${this.SERVER_URL}/api/folders/${folderId}/`);
    return this.http.delete(url.toString());
  }

  createText(params: any[]) {
    const formData = new FormData();
    for (const param in params) {
      if ({}.hasOwnProperty.call(params, param)) {
        const paramValue = params[param];
        if (param == 'textfile') {
          formData.append('textfile', paramValue, paramValue.name);
        } else {
          formData.append(param, paramValue);
        }
      }
    }


    const url = new URL(`${this.SERVER_URL}/api/pub/texts/`);

    return this.http.post(url.toString(), formData);
  }

  deleteText(textId: string) {
    const url = new URL(`${this.SERVER_URL}/api/pub/texts/${textId}/`);
    return this.http.delete(url.toString(), { });
  }

  getTextInfo(textId: string): Observable<TextObject> {
    const url = new URL(`${this.SERVER_URL}/api/pub/texts/${textId}/`);
    return this.http.get<TextObject>(url.toString(), { });
  }

  getSpeakers(sharedfolderId: number) {
    const url = new URL(
        `${this.SERVER_URL}/api/sharedfolders/${sharedfolderId}/`);
    return this.http.get<JSON[]>(url.toString(), { });
  }

  setSpeakers(sharedfolderId: number, speakers: number[]) {
    const url = new URL(
        `${this.SERVER_URL}/api/sharedfolders/${sharedfolderId}/`);
    return this.http.put<JSON>(url.toString(), {speaker_ids: speakers}, { });
  }

  getAllUsers() {
    const url = new URL(`${this.SERVER_URL}/api/users/`);
    return this.http.get<User[]>(url.toString(), { });
  }

  downloadFolder(folderId: number): Observable<ArrayBuffer> {
    const url = new URL(`${this.SERVER_URL}/api/download/${folderId}/`);
    return this.http.get<ArrayBuffer>(url.toString(), {
      responseType: 'arraybuffer' as 'json',
    });
  }
}

