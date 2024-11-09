from rest_framework.response import Response # takes in any python/serialized data to JSON
from rest_framework.decorators import api_view


@api_view(['GET'])
def getData(request):
    person = {
        "name": "John Doe",
        "age": 29,
        "city": "New York"
    }
    return Response(person)

@api_view(['POST'])
def testData(request):
    print("Received POST data:", request.data)
    return Response({"message": "Data received successfully"})