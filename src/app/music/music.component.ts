import {Component, OnInit} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {parse} from 'node-html-parser';
import {map} from 'rxjs/operators';
import {NgForm} from '@angular/forms';

@Component({
  selector: 'app-music',
  templateUrl: './music.component.html',
  styleUrls: ['./music.component.scss']
})
export class MusicComponent implements OnInit {
  songsLinks: string[] = [];
  songsNames: string[] = [];
  authorNames: string[] = [];
  downloadLinks: string[] = [];


  constructor(private httpClient: HttpClient) {
  }

  async ngOnInit() {

  }

  async onSubmit(mainForm: NgForm) {
    this.downloadLinks = [];
    this.songsNames = [];
    this.songsLinks = [];
    this.authorNames = [];
    const albumLink = mainForm.value.albumLink;

    const cors = 'https://cors-anywhere.herokuapp.com';
    const result = await this.httpClient.get(
      `${cors}/${albumLink}`
      , {responseType: 'text'}).toPromise();
    const root = parse(result);
    // @ts-ignore
    this.songsLinks = root.querySelectorAll('.name.d-table-cell a').map(song => song.attributes.href);
    // @ts-ignore
    this.authorNames = root.querySelectorAll('.author-ellepsis a').map(authorName => authorName.text);
    // @ts-ignore
    this.songsNames = root.querySelectorAll('.name.d-table-cell a').map(song => song.attributes.title);

    if (this.songsLinks.length === 0) {
      // @ts-ignore
      this.songsNames = root.querySelectorAll('h1.title').map(title => title.text.split(' - ')[0]);
      // @ts-ignore
      this.authorNames = root.querySelectorAll('h1.title').map(title => title.text.split(' - ')[1]);
      console.log(this.songsNames);
      console.log(this.authorNames);

      // @ts-ignore
      const downloads = root.querySelectorAll('.download_item');
      const downloadItem = downloads.filter(
        download => download.attributes.href.toString().includes('/320/'))[0].attributes.href.toString();
      this.downloadLinks.push(downloadItem);

    } else {

      console.log(this.songsNames);
      console.log(this.authorNames);


      this.songsLinks.forEach(async songLink => {
        const itemResult = await this.httpClient.get(`${cors}/${songLink}`, {responseType: 'text'}).toPromise();
        const itemRoot = parse(itemResult);
        // @ts-ignore
        const downloads = itemRoot.querySelectorAll('.download_item');
        const downloadItem = downloads.filter(
          download => download.attributes.href.toString().includes('/320/'))[0].attributes.href.toString();
        this.downloadLinks.push(downloadItem);
      });
    }

  }
}

