import math
n = int(raw_input())
q = int(raw_input())
arr = []
res = []
for i in xrange(n):
	arr.append(i+1)
	res.append(i+1)
t = 0
x = 0
shift = 0
pshift = q*n
swo = 0
swe = 0
for i in xrange(q):
	t = int(raw_input())
	if (t == 1):
		x = int(raw_input())
		shift += (x+n)
	else:
		if ((shift+swe+pshift) % 2 == 0):
			swe++
			swo--
		else:
			swe--
			swo++
for i in xrange(n):
	if i % 2 == 0:
		res[(i+shift+swe+pshift)%n] = arr[i]
	else:
		res[(i+shift+swo+pshift)%n] = arr[i]
for i in xrange(n):
	print res[i]
	if (i == n-1):
		print "\n"
	else:
		print " "