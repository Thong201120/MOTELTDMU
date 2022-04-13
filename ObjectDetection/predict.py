import pickle
import cv2
import sys
f = open('./ObjectDetection/my_classifier.pickle', 'rb')
classifier = pickle.load(f)
test_data = [str(sys.argv[1])]
predicted = classifier.predict(test_data)
print(predicted[0])