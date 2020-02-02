import { Injectable, ModuleWithComponentFactories } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';

import * as RecordRTC from 'recordrtc';
import { TextServiceService } from './text-service.service';


@Injectable({
  providedIn: 'root'
})
export class AudioRecordingService {

  private stream: MediaStream;
  private recorder;
  private recorded = new Map<number, Blob>()
  private recordingFailed$ = new Subject<string>();
  private state$ = new Subject<boolean>();
  private recordingLength$ = new Subject<number>();
  private recordingPosition$ = new Subject<number>();
  private isPlaying$ = new Subject<boolean>();

  private recordingId: number;
  private activeSentence: number;
  private furthestSentence: number;
  private sentenceHasRecording: boolean;
  private audio = new Audio();

  private baseUrl = "http://127.0.0.1:8000";
  private sentenceRecordingUrl = this.baseUrl + "/api/sentencerecordings/";
  private authToken = "Token b81c0b29328e2f247da76fba6dc9d8b628cd6baf";

  private httpOptions = {
    headers: new HttpHeaders({
      'Authorization': this.authToken
    })
  };

  constructor(private textService: TextServiceService, private http: HttpClient) {
    textService.getActiveSentenceIndex().subscribe((index) => this.activeSentence = index);
    textService.getFurthestSentenceIndex().subscribe((index) => this.furthestSentence = index);
    textService.getRecordingId().subscribe((id) => {
      this.recordingId = id;
      this.resetRecordingData();
    });
    textService.getSentenceHasRecording().subscribe((value) => this.sentenceHasRecording = value);
  }

  resetRecordingData() {
    this.recorded = new Map<number, Blob>()

  }

  recordingFailed(): Observable<string> {
    return this.recordingFailed$.asObservable();
  }

  getRecordingState(): Observable<boolean> {
    return this.state$.asObservable();
  }

  getIsPlayingState(): Observable<boolean> {
    return this.isPlaying$.asObservable();
  }

  startRecording() {
    if (this.recorder) {
      // It means recording is already started or it is already recording something
      return;
    }

    navigator.mediaDevices.getUserMedia({ audio: true }).then(s => {
      this.stream = s;
      this.record();
    }).catch(error => {
      this.recordingFailed$.next();
      this.state$.next(false);
      console.log(error)
    });

  }

  private record() {

    this.recorder = new RecordRTC.StereoAudioRecorder(this.stream, {
      type: 'audio',
      mimeType: 'audio/wav',
      // audioBitsPerSecond: 16000,
      desiredSampRate: 16000,
      numberOfAudioChannels: 1

    });
    this.recorder.record();
    this.state$.next(true);

  }

  safeRecording(index: number, blob: Blob) {
    this.recorded.set(index, blob)
    this.uploadRecording(index, blob);
  }

  uploadRecording(index: number, blob: Blob) {
    let blobFile = new File([blob], "recording.wav");

    let formdata = new FormData();
    formdata.append("audiofile", blobFile);
    //check if sentence has already been recorded
    if(!this.sentenceHasRecording) {
      formdata.append("recording", this.recordingId.toString());
      formdata.append("index", index.toString());
      this.http.post(this.sentenceRecordingUrl, formdata, this.httpOptions).subscribe((response) => "");
    } else {
      // replace existing sentence recording
      this.http.put(this.sentenceRecordingUrl + `${this.recordingId}/?index=${this.activeSentence}`,
       formdata, this.httpOptions).subscribe((response) => "");
    }
  }

  stopRecording() {

    if (this.recorder) {
      this.recorder.stop((blob) => {
        this.safeRecording(this.activeSentence, blob);
        if (this.activeSentence === this.furthestSentence) {
          this.textService.increaseFurthestSentence();
        }
        this.stopMedia();
      }, () => {
        this.stopMedia();
        this.recordingFailed$.next();
      });
    }

  }
 // TODO: export safe into own function
  nextRecording() {
    if (this.recorder) {
      this.recorder.stop((blob) => {
        this.safeRecording(this.activeSentence, blob);
        //start next recording here because otherwise the functions would be run before the blob is safed
        if (this.activeSentence === this.furthestSentence) {
          this.textService.increaseFurthestSentence();
        }
        // if the next sentence hasn't been recorded before start next recording otherwise just skip to next sentence
        if (this.activeSentence >= this.furthestSentence - 1) {
          this.record();
          this.textService.setNextSenteceActive();
        } else {
          this.stopMedia();
          this.textService.setNextSenteceActive();
        }
      }, () => {
        this.stopMedia();
        this.recordingFailed$.next();
      });
    }
  }

  private stopMedia() {
    this.state$.next(false);
    if (this.recorder) {
      this.recorder = null;
      if (this.stream) {
        this.stream.getAudioTracks().forEach(track => track.stop());
        this.stream = null;
      }
    }
  }

  abortRecording(): void {
    this.stopMedia();
  }

  async fetchSentenceRecording() {
    //set blob as response type
    let audioHttpOptions = {
      headers: new HttpHeaders({
        'Authorization': this.authToken
      }),
      responseType: 'blob' as 'json'
    };

    return await this.http.get<Blob>(this.baseUrl + `/api/sentencerecordings/${this.recordingId}/?index=${this.activeSentence}`,
      audioHttpOptions).toPromise();
  }

  async playRecording() {
    let blob: Blob;
    if (this.recorded.has(this.activeSentence)) {
      blob = this.recorded.get(this.activeSentence);
    } else {
      blob =  await this.fetchSentenceRecording();
    }
    this.audio.src = URL.createObjectURL(blob);
    this.audio.load();
    this.audio.play();

    this.audio.addEventListener("play", () => {
      this.isPlaying$.next(true);
    })
    this.audio.addEventListener("pause", () => {
      this.isPlaying$.next(false);
    })

  }

  stopAudioPlaying(): void {
    this.audio.pause();
    this.audio.currentTime = 0;
  }

}
