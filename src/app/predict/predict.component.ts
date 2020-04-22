import { Component, OnInit } from '@angular/core';
import { ShareServiceService } from '../services/share-service.service';

@Component({
  selector: 'app-predict',
  templateUrl: './predict.component.html',
  styleUrls: ['./predict.component.css'],
})
export class PredictComponent implements OnInit {
  selectedUnit: string;
  selectedPredUnit: string;
  units: string[] = ['Miles', 'Meters', 'Kilometers'];
  title = 'split';
  minutes = '';
  seconds = '';
  distance = '';
  preddistance = '';
  strPredTime = '';
  PredTimeCalcAvg = 0;
  compMeters;
  compMiles;
  compKilo;

  constructor(private share: ShareServiceService) {
    this.distance = sessionStorage.getItem('distance');
    this.preddistance = sessionStorage.getItem('preddistance');
    this.minutes = sessionStorage.getItem('minutes');
    this.seconds = sessionStorage.getItem('seconds');
  }

  ngOnInit(): void {
    if (sessionStorage.getItem('compunit').length > 0) {
      this.selectedUnit = sessionStorage.getItem('compunit');
    } else {
      this.selectedUnit = 'Meters';
    }

    if (sessionStorage.getItem('predunit').length > 0) {
      this.selectedPredUnit = sessionStorage.getItem('predunit');
    } else {
      this.selectedPredUnit = 'Meters';
    }
    this.calcTime();
  }

  calcTime() {
    var time = mmsstomin(this.minutes, this.seconds);
    var convdistance = parseFloat(this.distance);
    var preddistance = parseFloat(this.preddistance);
    var convpreddistance = parseFloat(this.preddistance);

    if (this.selectedUnit == 'Miles') {
      convdistance = convdistance * 1609.344;
    }
    if (this.selectedUnit == 'Meters') {
      convdistance = parseFloat(this.distance);
    }
    if (this.selectedUnit == 'Kilometers') {
      convdistance = convdistance * 1000;
    }

    if (this.selectedPredUnit == 'Miles') {
      convpreddistance = convpreddistance * 1609.344;
    }
    if (this.selectedPredUnit == 'Meters') {
      convpreddistance = parseFloat(this.preddistance);
    }
    if (this.selectedPredUnit == 'Kilometers') {
      convpreddistance = convpreddistance * 1000;
    }

    console.log(
      'Converted meters: ',
      convdistance,
      '  ',
      this.minutes,
      ':',
      this.seconds,
      ' Predicted Meters: ',
      convpreddistance
    );

    function mmsstomin(min, sec) {
      return 60 * parseFloat(min) + parseFloat(sec);
    }


    console.log("convdistance: ", convdistance, " Speed: ", convdistance/mmsstomin(this.minutes,this.seconds));

    if (
      isNaN(parseFloat(this.distance)) ||
      isNaN(parseFloat(this.minutes)) ||
      isNaN(parseFloat(this.seconds)) ||
      (convdistance/mmsstomin(this.minutes,this.seconds)>30) ||
      (convdistance/mmsstomin(this.minutes,this.seconds)<0.5)
    ) {
      this.strPredTime = "";
      return;
    } else {
      function sectommss(totalSeconds) {
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

        return result;
      }

      //calculate Riegel predicted time
      var ratio = convpreddistance / convdistance;
      var predTimeCalc = time * Math.pow(ratio, 1.06);

      //calculate Cameron predicted time
      var a = 0;
      var b = 0;
      a =
        13.49681 -
        0.000030363 * convdistance +
        835.7114 / Math.pow(convdistance, 0.7905);
      b =
        13.49681 -
        0.000030363 * convpreddistance +
        835.7114 / Math.pow(convpreddistance, 0.7905);
      var predTimeCalcCam = (time / convdistance) * (a / b) * convpreddistance;

      //Avg of Riegel and Cameron
      this.PredTimeCalcAvg = (predTimeCalc + predTimeCalcCam) / 2;
      console.log("convpreddistance: ", convpreddistance, " Speed: ", convpreddistance/this.PredTimeCalcAvg, " Pred Time: ", this.PredTimeCalcAvg);
      if ((convpreddistance/this.PredTimeCalcAvg)<30 &&
        (convpreddistance/this.PredTimeCalcAvg)>0.5) {
        this.strPredTime = sectommss(this.PredTimeCalcAvg);
        }
        else{
          this.strPredTime = "";
      }

      //Export data to SESSION
      sessionStorage.setItem('distance', this.distance);
      sessionStorage.setItem('preddistance', this.preddistance);
      sessionStorage.setItem(
        'predtimecalcavg',
        this.PredTimeCalcAvg.toString()
      );
      sessionStorage.setItem('minutes', this.minutes);
      sessionStorage.setItem('seconds', this.seconds);
      sessionStorage.setItem('compunit', this.selectedUnit);
      sessionStorage.setItem('predunit', this.selectedPredUnit);
      sessionStorage.setItem('convpreddistance', convpreddistance.toString());
      sessionStorage.setItem('convdistance', convdistance.toString());
      this.share.setPredTime(this.PredTimeCalcAvg);
      this.share.setRaceDist(this.preddistance);
    }
  }
}
