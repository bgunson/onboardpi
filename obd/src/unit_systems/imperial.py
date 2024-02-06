import obd

imperial_conversions = {
    "kilometer": obd.Unit.mile,
    "kilometer_per_hour": obd.Unit.mile_per_hour,
    "kilopascal": obd.Unit.psi,
    "gps": obd.Unit.pound / obd.Unit.minute,            # grams per second
    "degree_Celsius": obd.Unit.degree_Fahrenheit
}

def convert_to_imperial(obd_response: obd.OBDResponse) -> obd.OBDResponse:

    unit_key = str(obd_response.unit)

    if unit_key in imperial_conversions:
        obd_response.value = obd_response.value.to(imperial_conversions[unit_key])

    return obd_response