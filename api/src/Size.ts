import { Address } from "./Address";

export const Size = new Map([
  // EEPROM
  [Address.ModelNumber, 2],
  [Address.FirmwareWersion, 1],
  [Address.ID, 1],
  [Address.BoundRate, 1],
  [Address.ReturnDelatTime, 1],
  [Address.CWAngleLimit, 2],
  [Address.CWWAngleLimit, 2],
  [Address.TemperatureLimit, 1],
  [Address.MinVoltageLimit, 1],
  [Address.MaxVoltageLimit, 1],
  [Address.MaxTorque, 2],
  [Address.StatusReturnLevel, 1],
  [Address.AlarmLED, 1],
  [Address.Shutdown, 1],
  //RAM
  [Address.TorqueEnable, 1],
  [Address.LED, 1],
  [Address.CWComplianceMargin, 1],
  [Address.CCWComplianceMargin, 1],
  [Address.CWComplianceSlope, 1],
  [Address.CCWComplianceSlope, 1],
  [Address.GoalPosition, 2],
  [Address.MovingSpeed, 2],
  [Address.TorqueLimit, 2],
  [Address.PresentPosition, 2],
  [Address.PresentSpeed, 2],
  [Address.PresentLoad, 2],
  [Address.PresentVoltage, 1],
  [Address.PresentTemperature, 1],
  [Address.Registered, 1],
  [Address.Moving, 1],
  [Address.Lock, 1],
  [Address.Punch, 2],
]);
