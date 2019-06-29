import xgboost

import argparse as ap
from pickle import load

import numpy as np
from skimage.color import rgb2gray
from skimage.feature import greycomatrix, greycoprops, hog, local_binary_pattern
from skimage.io import imread
from sklearn.preprocessing import LabelEncoder

parser = ap.ArgumentParser(description="Model Loader and Predictor")

parser.add_argument("image", type=str, help="Image Path.")
parser.add_argument("descriptor", type=str, choices=["color", "lbp", "glcm"])

args = parser.parse_args()

image = imread(args.image)

if args.descriptor == "color":
    desc, _ = np.histogram(image, bins=10)

elif args.descriptor == "lbp":
    radius = 4.0
    n_points = 10 * radius

    image = rgb2gray(image)
    label = local_binary_pattern(image, n_points, radius, method="uniform")
    n_bins = int(max(label.flatten()))
    desc, _ = np.histogram(label, bins=n_bins, range=(0, n_bins))

elif args.descriptor == "glcm":
    distances = np.arange(0, 11)
    angles = [0, np.pi / 4, np.pi / 2, 3 * np.pi / 4]
    properties = ["contrast", "energy", "homogeneity", "correlation", "dissimilarity"]

    img = np.dot(rgb2gray(image), 255)
    img = np.array(img, dtype=np.uint8)
    glcm = greycomatrix(img, distances, angles, symmetric=True)
    contrast = greycoprops(glcm, properties[0]).mean()
    energy = greycoprops(glcm, properties[1]).mean()
    homogeneity = greycoprops(glcm, properties[2]).mean()
    correlation = greycoprops(glcm, properties[3]).mean()
    dissimilarity = greycoprops(glcm, properties[4]).mean()

    desc = [contrast, energy, homogeneity, correlation, dissimilarity]

xgb = load(open("xgb_" + args.descriptor + ".pickle.dat", "rb"))

le = LabelEncoder()

labels = le.fit_transform(
    [
        "agata_potato",
        "asterix_potato",
        "cashew",
        "diamond_peach",
        "fuji_apple",
        "granny_smith_apple",
        "honneydew_melon",
        "kiwi",
        "nectarine",
        "onion",
        "orange",
        "plum",
        "spanish_pear",
        "taiti_lime",
        "watermelon",
    ]
)

prediction = xgb.predict(np.array([desc]))

class_name = le.inverse_transform(prediction)[0]

print(class_name)
