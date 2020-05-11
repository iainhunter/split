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
  predUnit;
  adjustment = 1;

  constructor(private share: ShareServiceService) {
    this.predDistance = sessionStorage.getItem('preddistance');
    this.predUnit = sessionStorage.getItem('predunit');
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
    if (cumulTime - parseFloat(this.predCumulArray[this.completedSplits]) < 0) {
        this.deltaArray.push("-" + (parseFloat(this.predCumulArray[this.completedSplits]) - cumulTime).toString());
    }
    else
    {
        this.deltaArray.push((cumulTime - parseFloat(this.predCumulArray[this.completedSplits])).toString());
    }

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
    function sectommss(totalSeconds) {
      var negative = 0;
      if (totalSeconds<0) {
        totalSeconds = -totalSeconds;
        negative = 1;
      }
      totalSeconds = parseFloat(totalSeconds);
      var hours   = Math.floor(totalSeconds / 3600);
      var minutes = Math.floor((totalSeconds - (hours * 3600)) / 60);
      var seconds = totalSeconds - (hours * 3600) - (minutes * 60);

      // round seconds
      if (totalSeconds>=3600) {
        seconds = Math.round(seconds)
      }
      seconds = Math.round(seconds * 100) / 100

      if (totalSeconds>=3600) {
          var result = (hours < 10 ? "" + hours : hours).toString();
          result += ":" + (minutes < 10 ? "0" + minutes : minutes).toString();
          result += ":" + (seconds  < 10 ? "0" + seconds : seconds).toString();
      }
      else
      {
        var result = (minutes < 10 ? `${minutes}` : minutes).toString();
        result += ":" + (seconds  < 10 ? "0" + seconds : seconds).toString();
      }
      if (negative == 1) {
        return "-" + result;
      }
      else
      {
        return result;
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
    this.strPredTime = sectommss(this.finishTime).toString();

    this.strPredDistance = this.predDistance.toString() + " " + this.predUnit;

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
    if (this.predUnit == "Meters") {
      this.adjustment = 1;
    }
    if (this.predUnit == "Miles") {
      this.adjustment = 1609.344;
    }
    if (this.predUnit == "Kilometers") {
      this.adjustment = 1000;
    }

    sessionStorage.setItem('splitDist', this.splitdistance);
    if (this.selectedUnit == "Meters") {
      this.numSplits = this.predDistance * this.adjustment / this.splitdistance;
      this.speed = this.predDistance * this.adjustment / this.finishTime;
      sessionStorage.setItem('splitUnit', "Meters");
    }
    if (this.selectedUnit == "Miles") {
      this.numSplits = this.predDistance * this.adjustment / (this.splitdistance*1609.344);
      this.speed = this.predDistance * this.adjustment / this.finishTime;
      sessionStorage.setItem('splitUnit', "Miles");
    }
    if (this.selectedUnit == "Kilometers") {
      this.numSplits = this.predDistance * this.adjustment / (this.splitdistance * 1000);
      this.speed = this.predDistance * this.adjustment / this.finishTime;
      sessionStorage.setItem('splitUnit', "Kilometers");
    }

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

    if (this.selectedUnit == "Meters") {
      tempSplitDist = (this.predDistance * this.adjustment).toString();
      tempSplitDist = Math.round(parseFloat(tempSplitDist)).toString();
    }
    if (this.selectedUnit == "Miles") {
      tempSplitDist = ((parseFloat(this.predDistance) * this.adjustment) / 1609.344).toString();
    }
    if (this.selectedUnit == "Kilometers") {tempSplitDist = ((parseFloat(this.predDistance) * this.adjustment) / 1000).toString();}



    var digits = tempSplitDist.length;
    for (let i = 0; i < 3; i++) {
      digits = tempSplitDist.length;
      if (digits < 5) {
        tempSplitDist = ' ' + tempSplitDist;
      }
    }
    this.strSplits = this.strSplits.concat("Finish" + ' ');
    this.strSplits = this.strSplits.concat(sectommss(this.finishTime).toString());

    this.strActual = '    Lap  Cumul  On Pace\n';
    for (let i = 0; i < this.numSplits; i++) {
      this.strActual = this.strActual.concat('\n');
    }

    //Convert seconds to time format m:ss.00
    function sectommss(totalSeconds) {
      totalSeconds = parseFloat(totalSeconds);
      var hours   = Math.floor(totalSeconds / 3600);
      var minutes = Math.floor((totalSeconds - (hours * 3600)) / 60);
      var seconds = totalSeconds - (hours * 3600) - (minutes * 60);

      // round seconds
      if (totalSeconds>=3600) {
        seconds = Math.round(seconds)
      }
      seconds = Math.round(seconds * 100) / 100;

      if (totalSeconds>=3600) {
          var result = (hours < 10 ? "" + hours : hours).toString();
          result += ":" + (minutes < 10 ? "0" + minutes : minutes).toString();
          result += ":" + (seconds  < 10 ? "0" + seconds : seconds).toString();
      }
      else
      {
        var result = (minutes < 10 ? `${minutes}` : minutes).toString();
        result += ":" + (seconds  < 10 ? "0" + seconds : seconds).toString();
      }
      return result;
    }
  }
}
