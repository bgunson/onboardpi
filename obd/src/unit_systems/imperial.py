import obd

conversions = {
    "kilometer": obd.Unit.mile,
    "kilometer_per_hour": obd.Unit.mile_per_hour,
    "kilopascal": obd.Unit.psi,
    "gps": obd.Unit.pound / obd.Unit.minute, # grams per second
    "degree_Celsius": obd.Unit.degree_Fahrenheit
}

def convert(obd_response: obd.OBDResponse) -> obd.OBDResponse:

    unit_key = str(obd_response.unit)

    if unit_key in conversions:
        obd_response.value = obd_response.value.to(conversions[unit_key])

    return obd_response