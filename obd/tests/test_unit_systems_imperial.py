from src.unit_systems import imperial
import obd

unit = obd.Unit

def test_kilometer_to_mile():
    km = str(unit.kilometer)
    assert km in imperial.conversions
    assert imperial.conversions[km] == unit.mile

def test_kph_to_mph():
    kph = str(unit.kph)
    assert kph in imperial.conversions
    assert imperial.conversions[kph] == unit.mph

def test_kpa_to_psi():
    kpa = str(unit.kilopascal)
    assert kpa in imperial.conversions
    assert imperial.conversions[kpa] == unit.psi

def test_gps_to_lb_per_minute():
    gps = str(unit.gps)
    lb_min = unit.pound / unit.minute
    assert gps in imperial.conversions
    assert imperial.conversions[gps] == lb_min