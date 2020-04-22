import { Component, OnInit } from '@angular/core';
import { ShareServiceService } from '../services/share-service.service';

@Component({
  selector: 'app-splittab',
  templateUrl: './splittab.component.html',
  styleUrls: ['./splittab.component.css'],
})
export class SplittabComponent implements OnInit {
  finishTime;
  predDistance;
  splitdistance;
  speed;
  strSplits = '';
  receiveDist;
  strPredTime = '';
  strPredDistance = '';
  minutes;
  seconds;
  timeData = '0.0';
  interval;
  startDate = new Date();
  startTime = 0;
  distance;
  splitDist;
  strActual;
  numSplits = 4;
  completedSplits = 0;
  prevSplit = 0;
  splitTime;
  cumulSplit;
  splitArray = new Array();
  cumulArray = new Array();
  deltaArray = new Array();
  predCumulArray = new Array();

  constructor(private share: ShareServiceService) {
    this.predDistance = sessionStorage.getItem('preddistance');
    this.splitdistance = parseFloat(sessionStorage.getItem('splitDist'));
    this.minutes = sessionStorage.getItem('minutes');
    this.seconds = sessionStorage.getItem('seconds');
  }

  increment() {
    var d = new Date();
    var n = d.getTime();
    var runningTime = n - this.startTime;
    this.timeData = runningTime.toString();
  }

  createSplit() {
    var splitTime = 0;
    var tempActual = '';
    var d = new Date();
    var n = d.getTime();
    var cumulTime = n - this.startTime;
    var lapsplit;

    if (parseFloat(sessionStorage.getItem('splitDist'))!>0) {
      sessionStorage.setItem('splitDist', "400");
      this.splitdistance = 400;
    }

    this.strActual = '    Lap  Cumul  On Pace\n';
    splitTime = cumulTime;
    lapsplit = splitTime - this.prevSplit;

    this.splitArray.push(lapsplit.toString());
    this.cumulArray.push(cumulTime.toString());
    this.completedSplits = this.completedSplits + 1;
    console.log("Lap: ", lapsplit, " PredSplit: ", this.predCumulArray[this.completedSplits]);
    this.deltaArray.push(
      (
        cumulTime - parseFloat(this.predCumulArray[this.completedSplits])
      ).toString()
    );
    console.log(this.predCumulArray[this.completedSplits]);

    this.prevSplit = splitTime;

    for (let i = 0; i < this.completedSplits; i++) {
      this.strActual = this.strActual.concat(
        sectommss(this.splitArray[i] / 1000) +
          '  ' +
          sectommss(this.cumulArray[i] / 1000) +
          '  ' +
          sectommss(this.deltaArray[i] / 1000) +
          '\n'
      );
    }

    //Convert seconds to time format m:ss.00
    function sectommss(sec) {
      sec = parseFloat(sec);
      var hours = Math.floor(sec / 3600);
      sec %= 3600;
      var minutes = Math.floor(sec / 60).toString();
      var seconds = sec % 60;
      var strseconds = seconds.toFixed(2);

      if (seconds == 0) {
        strseconds = '00.00';
      }
      if (sec < 3600 && sec >= 60) {
        if (seconds < 10) {
          strseconds = '0' + strseconds;
        }
        return minutes + ':' + strseconds;
      } else if (sec < 60) {
        return strseconds.padStart(2);
      } else {
        if (parseFloat(minutes) < 10) {
          minutes = '0' + minutes;
        }
        if (seconds < 10) {
          strseconds = '0' + strseconds;
        }
        strseconds = seconds.toFixed(0);
        return hours + ':' + minutes + ':' + strseconds;
      }
    }

    //Add empty rows to match estimated splits
    var rowsToAdd = this.numSplits - this.completedSplits;
    for (let i = 0; i < rowsToAdd; i++) {
      this.strActual = this.strActual.concat('\n');
    }
  }

  startTimer() {
    this.startDate = new Date();
    this.startTime = this.startDate.getTime();
    this.interval = setInterval(() => this.increment(), 100);
  }

  ngOnInit(): void {
    var oddSplit = false;
    var splitTemp = '';

    // Retrieve session data
    this.finishTime = parseFloat(sessionStorage.getItem('predtimecalcavg'));
    this.strPredTime = (this.finishTime * 1000).toString();
    this.strPredDistance = this.predDistance.toString();

    //Set splitDist to session
    sessionStorage.setItem('splitDist', this.splitdistance);

    this.numSplits = this.predDistance / this.splitdistance;
    this.speed = this.predDistance / this.finishTime;

    if (this.numSplits - Math.floor(this.numSplits) > 0) {
      this.numSplits = Math.floor(this.numSplits) + 1;
      oddSplit = true;
    } else {
      this.numSplits = Math.floor(this.numSplits);
    }

    this.strSplits = 'Split  Optimal  \n';
    var tempSplitDist = '';
    for (let i = 1; i < this.numSplits; i++) {
      tempSplitDist = (i * this.splitdistance).toString();
      var digits = tempSplitDist.length;
      for (let i = 0; i < 3; i++) {
        digits = tempSplitDist.length;
        if (digits < 5) {
          tempSplitDist = ' ' + tempSplitDist;
        }
      }

      this.strSplits = this.strSplits.concat(tempSplitDist + '  ');
      splitTemp = sectommss((i * this.splitdistance) / this.speed);
      this.predCumulArray.push(1000*((i-1) * this.splitdistance) / this.speed);
      this.strSplits = this.strSplits.concat(splitTemp.toString() + '\n');
    }

    tempSplitDist = this.predDistance.toString();
    var digits = tempSplitDist.length;
    for (let i = 0; i < 3; i++) {
      digits = tempSplitDist.length;
      if (digits < 5) {
        tempSplitDist = ' ' + tempSplitDist;
      }
    }
    this.strSplits = this.strSplits.concat(tempSplitDist + '  ');
    this.strSplits = this.strSplits.concat(
      sectommss(this.finishTime).toString()
    );

    this.strActual = '    Lap  Cumul  On Pace\n';
    for (let i = 0; i < this.numSplits; i++) {
      this.strActual = this.strActual.concat('\n');
    }

    //Convert seconds to time format m:ss.00
    function sectommss(sec) {
      sec = parseFloat(sec);
      var hours = Math.floor(sec / 3600);
      sec %= 3600;
      var minutes = Math.floor(sec / 60).toString();
      var seconds = sec % 60;
      var strseconds = seconds.toFixed(2);

      if (seconds == 0) {
        strseconds = '00.00';
      }
      if (sec < 3600 && sec >= 60) {
        if (seconds < 10) {
          strseconds = '0' + strseconds;
        }
        return minutes + ':' + strseconds;
      } else if (sec < 60) {
        return strseconds.padStart(2);
      } else {
        if (parseFloat(minutes) < 10) {
          minutes = '0' + minutes;
        }
        if (seconds < 10) {
          strseconds = '0' + strseconds;
        }
        strseconds = seconds.toFixed(0);
        return hours + ':' + minutes + ':' + strseconds;
      }
    }
  }
}
