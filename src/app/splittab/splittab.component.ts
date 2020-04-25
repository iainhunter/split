import { Component, OnInit } from '@angular/core';
import { ShareServiceService } from '../services/share-service.service';

@Component({
  selector: 'app-splittab',
  templateUrl: './splittab.component.html',
  styleUrls: ['./splittab.component.css'],
})
export class SplittabComponent implements OnInit {
  selectedUnit: string;
  units: string[] = ['Miles', 'Meters', 'Kilometers'];
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
    this.selectedUnit = sessionStorage.getItem('splitUnit');
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

    sessionStorage.setItem('splitUnit', this.selectedUnit);

    if (this.selectedUnit === null) {
      this.selectedUnit = "Meters";
      this.splitdistance = "400";
    }

    if (!(parseFloat(this.splitdistance)>0)) {
      if (this.selectedUnit = "Meters") {
        this.splitdistance = 400;
      }
      if (this.selectedUnit = "Miles") {
        this.splitdistance = 1;
      }
      if (this.selectedUnit = "Kilometers") {
        this.splitdistance = 1;
      }
    }

    // Retrieve session data
    this.finishTime = parseFloat(sessionStorage.getItem('predtimecalcavg'));
    this.strPredTime = (this.finishTime * 1000).toString();
    this.strPredDistance = this.predDistance.toString();
    if (this.selectedUnit === null) {
       this.selectedUnit = sessionStorage.getItem('predunit').toString();
    }
    if (sessionStorage.getItem('splitDist') === null) {
      if (this.selectedUnit == "Meters") {
        sessionStorage.setItem('splitDist', "400");
        sessionStorage.setItem('splitUnit', "Meters");
        this.splitdistance = 400;
      }
      if (this.selectedUnit == "Miles") {
        sessionStorage.setItem('splitUnit', "Miles");
        this.splitdistance = 1;
      }
      if (this.selectedUnit == "Kilometers") {
        sessionStorage.setItem('splitUnit', "Kilometers");
        this.splitdistance = 1;
      }
    }

    //Set splitDist to session
    sessionStorage.setItem('splitDist', this.splitdistance);
    if (this.selectedUnit == "Meters") {
      this.numSplits = this.predDistance / this.splitdistance;
      this.speed = this.predDistance / this.finishTime;
      sessionStorage.setItem('splitUnit', "Meters");
    }
    if (this.selectedUnit == "Miles") {
      this.numSplits = this.predDistance / (this.splitdistance*1609.344);
      this.speed = this.predDistance / this.finishTime;
      sessionStorage.setItem('splitUnit', "Miles");
    }
    if (this.selectedUnit == "Kilometers") {
      this.numSplits = this.predDistance / (this.splitdistance * 1000);
      this.speed = this.predDistance / this.finishTime;
      sessionStorage.setItem('splitUnit', "Kilometers");
    }

    console.log(this.speed);

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

      if (this.selectedUnit === "Meters") {
        splitTemp = sectommss((i * this.splitdistance) / this.speed);
      }
      if (this.selectedUnit === "Miles") {
        splitTemp = sectommss((i * this.splitdistance*1609.344) / this.speed);
      }
      if (this.selectedUnit === "Kilometers") {
        splitTemp = sectommss((i * this.splitdistance*1000) / this.speed);
      }

      this.predCumulArray.push(1000*((i-1) * this.splitdistance) / this.speed);
      this.strSplits = this.strSplits.concat(splitTemp.toString() + '\n');
    }

    if (this.selectedUnit == "Meters") {tempSplitDist = this.predDistance.toString();}
    if (this.selectedUnit == "Miles") {tempSplitDist = (parseFloat(this.predDistance) / 1609.344).toString();}
    if (this.selectedUnit == "Kilometers") {tempSplitDist = (parseFloat(this.predDistance) / 1000).toString();}

    var digits = tempSplitDist.length;
    for (let i = 0; i < 3; i++) {
      digits = tempSplitDist.length;
      if (digits < 5) {
        tempSplitDist = ' ' + tempSplitDist;
      }
    }
    this.strSplits = this.strSplits.concat(tempSplitDist + '  ');
    this.strSplits = this.strSplits.concat(sectommss(this.finishTime).toString());

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
